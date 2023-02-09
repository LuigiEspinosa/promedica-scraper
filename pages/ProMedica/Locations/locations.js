import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function Locations() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/find-locations/location-results', {
    waitUntil: 'domcontentloaded',
  });

  const root = '#location_PublicListView_searchresults > div >';

  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`);

  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`);

  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`);

  const numberPages = await page.$$eval(
    `${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`,
    (numberpages) => {
      return numberpages.map((numberPage) => {
        return parseInt(numberPage.innerText);
      });
    }
  );

  const totalPages = Math.max(...numberPages.filter((p) => !isNaN(p)));

  await delay(2000);
  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`);

  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`);

  let locations = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await delay(2000);
      await page.waitForSelector('#location_PublicListView_searchresults div[data-ng-include="\'search-record-template.html\'"]');

      const locationsPerPage = await page.$$eval(
        'xpath=/html/body/div/div[2]/div/div[3]/div[2]/div/div[4]/div/div/div/div/div/div/div/div/div/div[2]/div/div/div/div/div/div/div[1]/div/div/div',
        (itemLocation) => {
          return itemLocation.map((location) => {
            const imgSrc = location.querySelector('.ih-field-locationimage img')?.src || null;
            const imgText = location.querySelector('.ih-field-locationimage img')?.alt || null;
            const title = location.querySelector('.ih-field-locationname > div')?.innerText || null;
            const linkSrc = location.querySelector('.form-group a.btn.btn-primary')?.href || null;
            const linkText = location.querySelector('.form-group a.btn.btn-primary')?.innerText || null;
            const addressOne = location.querySelector('.ih-field-locationaddress .locationaddress-one')?.innerText || null;
            const addressTwo = location.querySelector('.ih-field-locationaddress .locationaddress-two')?.innerText || null;
            const phone = location.querySelector('.ih-field-locationphone > a')?.innerText || null;

            return {
              imgSrc,
              imgText,
              title,
              addressOne,
              addressTwo,
              phone,
              linkSrc,
              linkText,
            };
          });
        }
      );

      if (i != totalPages) {
        await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-next.ng-scope > a`);
      }

      locations.push(locationsPerPage);
      console.log('Locations Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const mergeLocations = locations.flat().map((item, index) => ({ id: index + 1, ...item }));
  const jsonContent = JSON.stringify(mergeLocations, null, 2);
  fs.writeFile('./json/ProMedica/locations/locations.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nLocations Imported!\n');
  });

  // Locations Images
  const locationsImages = mergeLocations.map((item) => item.imgSrc);
  const jsonLocationsImages = JSON.stringify(locationsImages, null, 2);
  fs.writeFile('./json/ProMedica/locations/locations-images.json', jsonLocationsImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nLocations Images Imported!\n');
  });

  // Press Release content
  const mergeLinks = mergeLocations.map((item) => {
    if (
      item.linkSrc.startsWith('https://www.promedica.org/') &&
      item.linkSrc !== 'https://www.promedica.org/find-locations/location-results'
    ) {
      return item.linkSrc;
    }
  });

  let locationsContent = [];
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

        const imgSrc = await page.$eval('ih-static-zone', (i) => i.querySelector('.ih-field-locationimage > img')?.src || null);

        const imgAlt = await page.$eval('ih-static-zone', (i) => i.querySelector('.ih-field-locationimage > img')?.alt || null);

        const name = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.ih-location-info-box .location-info > h2')?.innerText || null
        );

        const address = await page.$$eval('ih-static-zone .ih-location-info-box .location-info .location-address', (item) => {
          return item.map((location) => {
            const addressOne = location.querySelector('p:nth-child(1)')?.innerText || null;
            const addressTwo = location.querySelector('p:nth-child(2)')?.innerText || null;

            return {
              addressOne,
              addressTwo,
            };
          });
        });

        const directions = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.ih-location-info-box .location-info > a')?.href || null
        );

        const phone = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.ih-location-info-box > div > a.ih-location-phone')?.innerText || null
        );

        const fax = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.ih-location-info-box > div > p.location-fax')?.innerText || null
        );

        const campusMap = await page.$eval('ih-static-zone', (i) => i.querySelector('#downloadMap')?.href || null);

        const floorMap = await page.$eval('ih-static-zone', (i) => i.querySelector('#downloadFirstFloor')?.href || null);

        const description = await page.$eval(
          'ih-static-zone',
          (i) => i.querySelector('.form-group.ih-field-locationdescription')?.innerHTML || null
        );

        const virtualTour = await page.$eval('#ih-page-body', (i) => i.querySelector('a[href*="tourmkr.com"]')?.href || null);

        const operatingBody = await page.$eval(
          'ih-tabbed-zone',
          (i) =>
            i.querySelector('div.tab-pane.ng-scope > div > div > div.form-group.ih-field-dynamiccol_locationoperatinghoursbodycopy > div')
              ?.textContent || null
        );

        const operatingTable = await page.$eval('ih-tabbed-zone', (i) => {
          let operatingTable = i.querySelector(
            'div.tab-pane.ng-scope > div > div > div.form-group.ih-field-rawtextwithtokens > div > div[data-location-hours-prefix]'
          );
          if (operatingTable) operatingTable = operatingTable.innerHTML;
          return operatingTable;
        });

        const operating = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.form-group.ih-field-conditionalfield > ul > li',
          (item) => {
            let hours = [];
            item.forEach((item) => hours.push(item?.innerText || null));
            return hours;
          }
        );

        const services = await page.$$eval('ih-tabbed-zone > div > div > div.tab-pane.ng-scope > .ih-tab-1 > div', (item) => {
          let services = [];
          item.forEach((item) => {
            let serviceName = item.querySelectorAll('.ih-field-services .ih-field-servicename > div');
            if (serviceName) serviceName.forEach((service) => services.push(service?.innerText || null));
          });
          return services;
        });

        const amenities = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationamenities > div > ul > li',
          (item) => {
            let amenities = [];
            item.forEach((item) => amenities.push(item?.innerText || null));
            return amenities;
          }
        );

        const education = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationeduprogcopy > div > ul > li',
          (item) => {
            let education = [];
            item.forEach((item) => education.push(item?.innerText || null));
            return education;
          }
        );

        const pricing = await page.$eval(
          '.ih-location-detail-middle',
          (i) => i.querySelector('ih-static-zone div.pricing-not-empty > div.card > div.cta-card-btm > a')?.href || null
        );

        const volunteer = await page.$eval(
          '#ih-page-footer',
          (i) =>
            i.querySelector('ih-tabbed-zone div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationvolunteeringcopy > div')
              ?.innerHTML || null
        );

        const foundations = await page.$eval(
          '#ih-page-footer',
          (i) =>
            i.querySelector('ih-tabbed-zone div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationfoundationcopy > div')
              ?.innerHTML || null
        );

        const PFAC = await page.$eval(
          '#ih-page-footer',
          (i) =>
            i.querySelector('ih-tabbed-zone div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationpfacouncil > div')
              ?.innerHTML || null
        );

        const providers = await page.$$eval('#resultsWrapper_locationProviders > div', (item) => {
          return item.map((item) => {
            const imageSrc = item.querySelector('.card > img')?.src || null;
            const imageAlt = item.querySelector('.card > img')?.alt || null;
            const name = item.querySelector('.card .prov-name')?.innerText || null;
            const gender = item.querySelector('.card[data-gender]')?.getAttribute('data-gender') || null;
            const phone = item.querySelector('.card .prov-phone')?.innerText || null;
            const specialty = item.querySelector('.card .prov-specialty')?.innerText || null;
            const location = item.querySelector('.card .prov-locations')?.innerText || null;
            const details = item.querySelector('.card a.btn.btn-primary')?.href || null;

            let newPatients = item.querySelector('.card .prov-accept-new');
            newPatients ? (newPatients = true) : (newPatients = false);

            return {
              imageSrc,
              imageAlt,
              name,
              gender,
              phone,
              specialty,
              location,
              newPatients,
              details,
            };
          });
        });

        const moreProviders = await page.$eval(
          '#ih-page-footer',
          (i) => i.querySelector('.ih-location-providers #viewAllProviders')?.href || null
        );

        locationsContent.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          content: {
            imgSrc,
            imgAlt,
            name,
            address,
            directions,
            phone,
            fax,
            campusMap,
            floorMap,
            description: sanitize(description),
            virtualTour,
            operatingBody,
            operatingTable: sanitize(operatingTable),
            operating,
            services,
            amenities,
            education,
            pricing,
            volunteer: sanitize(volunteer),
            foundations: sanitize(foundations),
            PFAC: sanitize(PFAC),
            providers,
            moreProviders,
          },
        });

        console.log('Locations Details', i + 1, 'Done');
      } catch (error) {
        await page.close();
        await browser.close();
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(locationsContent, null, 2);
  fs.writeFile('./json/ProMedica/locations/locations-details.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nLocations Details Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
