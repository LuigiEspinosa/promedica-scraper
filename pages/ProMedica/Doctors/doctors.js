import fs from 'fs';
import { chromium } from 'playwright';

export default async function DoctorsProviders() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/find-a-doctor/provider-results', {
    waitUntil: 'domcontentloaded',
  });

  const root = '#provider_PublicListView_searchresults > div >';

  await page.waitForSelector(
    `${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`
  );
  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`);

  await page.waitForSelector(
    `${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`
  );
  const numberPages = await page.$$eval(
    `${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`,
    (numberpages) => {
      return numberpages.map((numberPage) => {
        return parseInt(numberPage.innerText);
      });
    }
  );

  const totalPages = Math.max(...numberPages.filter((p) => !isNaN(p)));

  await page.waitForSelector(
    `${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`
  );
  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`);

  let doctors = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector(
        `${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`
      );

      const doctorsPerPage = await page.$$eval(
        `${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`,
        (itemDoctors) => {
          return itemDoctors.map((doctor) => {
            const imgSrc = doctor.querySelector('.ih-field-providerimage img').src;
            const imgText = doctor.querySelector('.ih-field-providerimage img').alt;
            const name = doctor.querySelector(
              '.ih-field-providernamelink .doctor-name-link > a'
            ).innerText;
            const linkSrc = doctor.querySelector(
              '.form-group .view-profile-btn:not(mychart-appointment__button) a.btn.btn-primary'
            ).href;
            const linkText = doctor.querySelector(
              '.form-group .view-profile-btn:not(mychart-appointment__button) a.btn.btn-primary'
            ).innerText;

            let specialty = doctor.querySelector('.ih-field-primaryspecialty > div');
            let location = doctor.querySelector('.form-group > .primary-location');
            let phone = doctor.querySelector('.ih-field-primaryphone > div > a');

            if (specialty) specialty = specialty.innerText;
            if (location) location = location.innerText;
            if (phone) phone = phone.innerText;

            return {
              imgSrc,
              imgText,
              name,
              specialty,
              location,
              phone,
              linkSrc,
              linkText,
            };
          });
        }
      );

      if (i != totalPages) {
        await page.click(
          `${root} div:nth-child(4) > div > div > ul > li.pagination-next.ng-scope > a`
        );
      }

      doctors.push({
        site: 'Doctors',
        page: i,
        doctors: doctorsPerPage,
      });

      console.log('Doctors Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const jsonDoctors = JSON.stringify(doctors, null, 2);
  fs.writeFile('./json/ProMedica/doctors/doctors.json', jsonDoctors, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nDoctors Imported!\n');
  });

  // Doctors Images
  const allDoctorsImages = doctors.map((item) => item.doctors.map((src) => src.imgSrc));
  const mergeImagesLinks = [...new Set([].concat(...allDoctorsImages.map((src) => src)))];

  const jsonDoctorsImages = JSON.stringify(mergeImagesLinks, null, 2);
  fs.writeFile('./json/ProMedica/doctors/doctors-images.json', jsonDoctorsImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nDoctors Images Imported!\n');
  });

  // Doctors Details
  const allDoctorsLink = doctors.map((item) => item.doctors.map((src) => src.linkSrc));
  const mergeLinks = [...new Set([].concat(...allDoctorsLink.map((src) => src)))];

  let doctorsDetails = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined && mergeLinks[i].includes('https://www.promedica.org')) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('ih-static-zone');

        const imgSrc = await page.$eval('ih-static-zone', (i) => {
          let img = i.querySelector('.ih-field-image > img');
          if (img) img = img.src;
          return img;
        });

        const imgAlt = await page.$eval('ih-static-zone', (i) => {
          let img = i.querySelector('.ih-field-image > img');
          if (img) img = img.alt;
          return img;
        });

        const videoSrc = await page.$eval('ih-static-zone', (i) => {
          let video = i.querySelector('#providerVideo > .video-module-inner > iframe');
          if (video) video = video.src;
          return video;
        });

        const name = await page.$eval('ih-static-zone', (i) => {
          let name = i.querySelector('.ih-field-providername > h1');
          if (name) name = name.innerText;
          return name;
        });

        const services = await page.$eval('ih-static-zone', (i) => {
          let services = i.querySelector('.ih-field-primaryspecialty > a');
          if (services) services = services.innerText;
          return services;
        });

        const specialties = await page.$$eval(
          'ih-static-zone div.ih-field-specialties > ul.ih-field-specialties',
          (ul) => {
            return ul.map((li) => {
              let specialties = li.querySelector('li');
              if (specialties) specialties = specialties.innerText;
              return specialties;
            });
          }
        );

        const location = await page.$eval('ih-static-zone', (i) => {
          let location = i.querySelector('.ih-field-primarylocationname > div');
          if (location) location = location.innerText;
          return location;
        });

        const gender = await page.$eval('ih-static-zone', (i) => {
          let gender = i.querySelector('.form-group > div > #genderAndAge');
          if (gender) gender = gender.innerText;
          return gender;
        });

        const language = await page.$eval('ih-static-zone', (i) => {
          let language = i.querySelector('.ih-field-providerlanguages > span');
          if (language) language = language.innerText;
          return language;
        });

        const virtual = await page.$eval('ih-static-zone', (i) => {
          let virtual = i.querySelector(
            '.form-group.ih-field-conditionalfield > div > .ih-telehealth'
          );
          if (virtual) virtual = true;
          return virtual;
        });

        const phone = await page.$eval('ih-static-zone', (i) => {
          let phone = i.querySelector('.ih-field-primarylocationphone > div > a');
          if (phone) phone = phone.innerText;
          return phone;
        });

        const fax = await page.$eval('ih-static-zone', (i) => {
          let fax = i.querySelector('.ih-field-primaryfax > div');
          if (fax) fax = fax.innerText;
          return fax;
        });

        const appointment = await page.$eval('ih-static-zone', (i) => {
          let appointment = i.querySelector('.form-group .mychart-appointment__button > a');
          if (appointment) appointment = appointment.src;
          return appointment;
        });

        const badge = await page.$eval('ih-static-zone', (i) => {
          let badge = i.querySelector(
            '.form-group.ih-field-conditionalfield > div.ih-ppg-badge > p'
          );
          if (badge) badge = badge.innerText;
          return badge;
        });

        await page.waitForSelector('ih-tabbed-zone');

        // let locations = await page.$eval("ih-static-zone", i => i.querySelector('ih-field-image > img'));
        // let hospitals = await page.$eval("ih-static-zone", i => i.querySelector('ih-field-image > img'));
        // let conditions = await page.$eval("ih-static-zone", i => i.querySelector('ih-field-image > img'));
        // let biography = await page.$eval("ih-static-zone", i => i.querySelector('ih-field-image > img'));
        // let education = await page.$eval("ih-static-zone", i => i.querySelector('ih-field-image > img'));
        // let news = await page.$eval("ih-static-zone", i => i.querySelector('ih-field-image > img'));

        // if (locations) locations = locations;
        // if (hospitals) hospitals = hospitals;
        // if (conditions) conditions = conditions;
        // if (biography) biography = biography;
        // if (education) education = education;
        // if (news) news = news;

        doctorsDetails.push({
          id: i + 1,
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
          // locations,
          // hospitals,
          // conditions,
          // biography,
          // education,
          // news
        });

        console.log('Doctor', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonDoctorsDetails = JSON.stringify(doctorsDetails, null, 2);
  fs.writeFile(
    './json/ProMedica/doctors/doctors-details.json',
    jsonDoctorsDetails,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nDoctors Details Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
