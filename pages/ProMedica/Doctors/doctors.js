import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function DoctorsProviders() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/find-a-doctor/provider-results', {
    waitUntil: 'domcontentloaded',
  });

  const root = '#provider_PublicListView_searchresults > div >';

  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`);

  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`);

  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`);

  const numberPages = await page.$$eval(
    `${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`,
    (numberpages) => {
      return numberpages.map((numberPage) => {
        return parseInt(numberPage?.innerText);
      });
    }
  );

  const totalPages = Math.max(...numberPages.filter((p) => !isNaN(p)));

  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`);

  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`);

  let doctors = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector('ih-static-zone');

      const doctorsPerPage = await page.$$eval('ih-static-zone[name="Header"] > div.row.ng-scope', (itemDoctors) => {
        return itemDoctors.map((doctor) => {
          const imgSrc = doctor.querySelector('.ih-field-providerimage img')?.src || null;
          const imgText = doctor.querySelector('.ih-field-providerimage img')?.alt || null;
          const name = doctor.querySelector('.ih-field-providernamelink .doctor-name-link > a')?.innerText || null;
          const linkSrc =
            doctor.querySelector('.form-group .view-profile-btn:not(mychart-appointment__button) a.btn.btn-primary')?.href || null;
          const linkText =
            doctor.querySelector('.form-group .view-profile-btn:not(mychart-appointment__button) a.btn.btn-primary')?.innerText || null;
          const specialty = doctor.querySelector('.ih-field-primaryspecialty > div')?.innerText || null;
          const location = doctor.querySelector('.form-group > .primary-location')?.innerText || null;
          const phone = doctor.querySelector('.ih-field-primaryphone > div > a')?.innerText || null;
          const makeAppointment =
            doctor.querySelector('.form-group .view-profile-btn.mychart-appointment__button a.btn.btn-primary')?.href || null;

          return {
            imgSrc,
            imgText,
            name,
            specialty,
            location,
            phone,
            linkSrc,
            linkText,
            makeAppointment,
          };
        });
      });

      if (i != totalPages) {
        await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-next.ng-scope > a`);
      }

      doctors.push(doctorsPerPage);
      console.log('Doctors Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const mergeDoctor = doctors.flat().map((item, index) => ({ id: index + 1, ...item }));
  const jsonDoctors = JSON.stringify(mergeDoctor, null, 2);
  fs.writeFile('./json/ProMedica/doctors/doctors.json', jsonDoctors, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nDoctors Imported!\n');
  });

  // Doctors Images
  const doctorsImages = mergeDoctor.map((item) => item?.imgSrc);
  const jsonDoctorsImages = JSON.stringify(doctorsImages, null, 2);
  fs.writeFile('./json/ProMedica/doctors/doctors-images.json', jsonDoctorsImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nDoctors Images Imported!\n');
  });

  // Doctors Details
  const mergeLinks = mergeDoctor.map((item) => {
    if (
      item.linkSrc.startsWith('https://www.promedica.org/') &&
      item?.linkSrc !== 'https://www.promedica.org/find-a-doctor/provider-results'
    ) {
      return item?.linkSrc;
    }
  });

  let doctorsDetails = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        let articlesTitle = await page.title();

        // * 403 ERROR - Uncomment if necessary
        function delay(time) {
          return new Promise(function (resolve) {
            setTimeout(resolve, time);
          });
        }

        while (articlesTitle.includes('ERROR')) {
          let wait = 200000;

          console.log('\n403 ERROR DETECTED');
          await delay(wait);
          wait = wait * 2;

          console.log('RELOADING PAGE\n');
          await page.reload();
          articlesTitle = await page.title();
        }

        await page.waitForSelector('ih-static-zone');
        await page.waitForSelector('ih-tabbed-zone');
        const footer = await page.locator('#ih-page-footer').isVisible();

        const imgSrc = await page.$eval('ih-static-zone', (i) => i.querySelector('.ih-field-image > img')?.src || null);

        const imgAlt = await page.$eval('ih-static-zone', (i) => i.querySelector('.ih-field-image > img')?.alt || null);

        const videoSrc = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('#providerVideo > .video-module-inner > iframe')?.src || null
        );

        const name = await page.$eval('ih-static-zone', (i) => i.querySelector('.ih-field-providername > h1')?.innerText || null);

        const services = await page.$eval('ih-static-zone', (i) => i.querySelector('.ih-field-primaryspecialty > a')?.innerText || null);

        const specialties = await page.$$eval('ih-static-zone div.ih-field-specialties > ul.ih-field-specialties > li', (item) => {
          let specialty = [];
          item.forEach((item) => specialty.push(item?.innerText));
          return specialty;
        });

        const location = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.ih-field-primarylocationname > div')?.innerText || null
        );

        const gender = await page.$eval('ih-static-zone', (i) => i.querySelector('.form-group > div > #genderAndAge')?.innerText || null);

        const language = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.ih-field-providerlanguages > span')?.innerText || null
        );

        const virtual = await page.$eval('ih-static-zone', (i) => {
          let virtual = i.querySelector('.form-group.ih-field-conditionalfield > div > .ih-telehealth');
          virtual ? (virtual = true) : (virtual = false);
          return virtual;
        });

        const phone = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.ih-field-primarylocationphone > div > a')?.innerText || null
        );

        const fax = await page.$eval('ih-static-zone', (i) => i.querySelector('.ih-field-primaryfax > div')?.innerText || null);

        const appointment = await page.$eval('ih-static-zone', (i) => i.querySelector('.form-group .mychart-appointment__button > a')?.src);

        const badge = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.form-group.ih-field-conditionalfield > div.ih-ppg-badge > p')?.innerText || null
        );

        const badgeLogoSrc = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.form-group.ih-field-conditionalfield > div.ih-ut-neuro-badge > img')?.src || null
        );

        const badgeLogoAlt = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.form-group.ih-field-conditionalfield > div.ih-ut-neuro-badge > img')?.alt || null
        );

        const locationName = await page.$eval(
          'ih-tabbed-zone',
          (i) =>
            i.querySelector('div.tab-pane.ng-scope > div > div.col-xs-12.col-md-4 > div.form-group.ih-field-primarylocationname > div')
              ?.innerText || null
        );

        const locationAddress = await page.$eval(
          'ih-tabbed-zone',
          (i) =>
            i.querySelector(
              'div.tab-pane.ng-scope > div > div.col-xs-12.col-md-4 > div.form-group.ih-field-primarylocationcompleteaddress > div'
            )?.innerText || null
        );

        const locationDirections = await page.$eval(
          'ih-tabbed-zone',
          (i) => i.querySelector('#getDirectionsPrimary > a[data-location]')?.href || null
        );

        const locationDetails = await page.$eval(
          'ih-tabbed-zone',
          (i) => i.querySelector('#getDirectionsPrimary > a.btn.btn-primary')?.href || null
        );

        let additionalLocations = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div.col-xs-12.col-md-8',
          (item) => {
            let locations = [];
            item.forEach((item) => {
              let credential = item.querySelectorAll('.form-group.ih-field-locations:not(.hidden)');
              if (credential) credential.forEach((service) => locations.push(service?.innerHTML));
            });
            return locations;
          }
        );

        additionalLocations = additionalLocations.map((item) => sanitize(item));

        const hospitalAffiliations = await page.$$eval('ih-tabbed-zone #resultsWrapper_affiliationLinks > a', (item) => {
          let hospitals = [];
          item.forEach((item) =>
            hospitals.push({
              hospitalName: item?.innerText || null,
              hospitalLink: item?.href || null,
            })
          );
          return hospitals;
        });

        const conditionsProcedures = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.form-group.ih-field-clinicalinterests > ul > li',
          (item) => {
            let conditions = [];
            item.forEach((item) => conditions.push(item?.innerText || null));
            return conditions;
          }
        );

        let biography;
        if (footer) {
          biography = await page.$eval(
            '#ih-page-footer',
            (i) =>
              i.querySelector('ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.form-group.ih-field-aboutme > div')
                ?.innerHTML || null
          );
        }

        let education = await page.$$eval('ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div', (item) => {
          let credentials = [];
          item.forEach((item) => {
            let credential = item.querySelectorAll('.form-group.ih-field-educations');
            if (credential) credential.forEach((service) => credentials.push(service?.innerHTML || null));
          });
          return credentials;
        });

        education = education.map((item) => sanitize(item));

        let media;
        if (footer) {
          media = await page.$eval(
            '#ih-page-footer',
            (i) =>
              i.querySelector('ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.form-group.ih-field-videos > div')
                ?.innerHTML || null
          );
        }

        let research;
        if (footer) {
          research = await page.$eval(
            '#ih-page-footer',
            (i) =>
              i.querySelector(
                'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.form-group.ih-field-dynamiccol_research > div'
              )?.innerHTML || null
          );
        }

        doctorsDetails.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          content: {
            imgSrc,
            imgAlt,
            videoSrc,
            name,
            services,
            specialties,
            location,
            gender,
            language,
            virtual,
            phone,
            fax,
            appointment,
            badge,
            badgeLogo: {
              src: badgeLogoSrc,
              alt: badgeLogoAlt,
            },
            primaryLocation: {
              locationName,
              locationAddress,
              locationDirections,
              locationDetails,
            },
            additionalLocations,
            hospitalAffiliations,
            conditionsProcedures,
            biography: sanitize(biography),
            education,
            media: sanitize(media),
            research: sanitize(research),
          },
        });

        console.log('Doctor', i + 1, 'Details Done');
      } catch (error) {
        await page.close();
        await browser.close();
        console.log({ error });
      }
    }
  }

  const jsonDoctorsDetails = JSON.stringify(doctorsDetails, null, 2);
  fs.writeFile('./json/ProMedica/doctors/doctors-details.json', jsonDoctorsDetails, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nDoctors Details Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
