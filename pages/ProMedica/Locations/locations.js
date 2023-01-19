import fs from 'fs';
import { chromium } from 'playwright';

export default async function Locations() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/find-locations/location-results', {
    waitUntil: 'domcontentloaded',
  });

  const root = '#location_PublicListView_searchresults > div >';

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

  let locations = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector(
        `${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`
      );

      const locationsPerPage = await page.$$eval(
        `${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`,
        (itemLocation) => {
          return itemLocation.map((location) => {
            const imgSrc = location.querySelector('.ih-field-locationimage img').src;
            const imgText = location.querySelector('.ih-field-locationimage img').alt;
            const title = location.querySelector('.ih-field-locationname > div').innerText;
            const linkSrc = location.querySelector('.form-group a.btn.btn-primary').href;
            const linkText = location.querySelector('.form-group a.btn.btn-primary').innerText;

            let addressOne = location.querySelector(
              '.ih-field-locationaddress .locationaddress-one'
            );
            let addressTwo = location.querySelector(
              '.ih-field-locationaddress .locationaddress-two'
            );
            let phone = location.querySelector('.ih-field-locationphone > a');

            if (addressOne) addressOne = addressOne.innerText;
            if (addressTwo) addressTwo = addressTwo.innerText;
            if (phone) phone = phone.innerText;

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
        await page.click(
          `${root} div:nth-child(4) > div > div > ul > li.pagination-next.ng-scope > a`
        );
      }

      locations.push({
        locations: locationsPerPage,
      });

      console.log('Locations Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const eachItem = locations.map((item, idx) =>
    item.locations.map((card, i) => {
      return { id: parseFloat(`${idx + 1}.${i}`), card };
    })
  );
  const mergeItems = [...new Set([].concat(...eachItem.map((item) => item)))];

  const jsonContent = JSON.stringify(mergeItems, null, 2);
  fs.writeFile('./json/ProMedica/locations/locations.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nLocations Imported!\n');
  });

  // Locations Images
  const mergeImagesLinks = [
    ...new Set([].concat(...eachItem.map((item) => item.map((src) => src.card.imgSrc)))),
  ];

  const jsonLocationsImages = JSON.stringify(mergeImagesLinks, null, 2);
  fs.writeFile(
    './json/ProMedica/locations/locations-images.json',
    jsonLocationsImages,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nLocations Images Imported!\n');
    }
  );

  // Press Release content
  const mergeLinks = mergeItems.map((item) => {
    if (item.card.linkSrc.startsWith('https://www.promedica.org/')) {
      return item.card.linkSrc;
    }
  });

  let locationsContent = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('ih-static-zone');
        await page.waitForSelector('ih-tabbed-zone');

        const articlesTitle = await page.title();

        const imgSrc = await page.$eval('ih-static-zone', (i) => {
          let img = i.querySelector('.ih-field-locationimage > img');
          if (img) img = img.src;
          return img;
        });

        const imgAlt = await page.$eval('ih-static-zone', (i) => {
          let img = i.querySelector('.ih-field-locationimage > img');
          if (img) img = img.alt;
          return img;
        });

        const name = await page.$eval('ih-static-zone', (i) => {
          let name = i.querySelector('.ih-location-info-box .location-info > h2');
          if (name) name = name.innerText;
          return name;
        });

        const address = await page.$$eval(
          'ih-static-zone .ih-location-info-box .location-info .location-address',
          (item) => {
            return item.map((location) => {
              let addressOne = location.querySelector('p:nth-child(1)');
              let addressTwo = location.querySelector('p:nth-child(2)');

              if (addressOne) addressOne = addressOne.innerText;
              if (addressTwo) addressTwo = addressTwo.innerText;

              return {
                addressOne,
                addressTwo,
              };
            });
          }
        );

        const directions = await page.$eval('ih-static-zone', (i) => {
          let directions = i.querySelector('.ih-location-info-box .location-info > a');
          if (directions) directions = directions.href;
          return directions;
        });

        const phone = await page.$eval('ih-static-zone', (i) => {
          let phone = i.querySelector('.ih-location-info-box > div > a.ih-location-phone');
          if (phone) phone = phone.innerText;
          return phone;
        });

        const fax = await page.$eval('ih-static-zone', (i) => {
          let fax = i.querySelector('.ih-location-info-box > div > p.location-fax');
          if (fax) fax = fax.innerText;
          return fax;
        });

        const campusMap = await page.$eval('ih-static-zone', (i) => {
          let campusMap = i.querySelector('#downloadMap');
          if (campusMap) campusMap = campusMap.href;
          return campusMap;
        });

        const floorMap = await page.$eval('ih-static-zone', (i) => {
          let floorMap = i.querySelector('#downloadFirstFloor');
          if (floorMap) floorMap = floorMap.href;
          return floorMap;
        });

        const description = await page.$eval('ih-static-zone', (i) => {
          let description = i.querySelector('.form-group.ih-field-locationdescription');
          if (description) description = description.innerHTML;
          return description;
        });

        const virtualTour = await page.$eval('#ih-page-body', (i) => {
          let virtualTour = i.querySelector('a[href*="tourmkr.com"]');
          if (virtualTour) virtualTour = virtualTour.href;
          return virtualTour;
        });

        const operatingBody = await page.$eval('ih-tabbed-zone', (i) => {
          let operatingBody = i.querySelector(
            'div.tab-pane.ng-scope > div > div > div.form-group.ih-field-dynamiccol_locationoperatinghoursbodycopy > div'
          );
          if (operatingBody) operatingBody = operatingBody.innerHTML;
          return operatingBody;
        });

        const operatingTable = await page.$eval('ih-tabbed-zone', (i) => {
          let operatingTable = i.querySelector(
            'div.tab-pane.ng-scope > div > div > div.form-group.ih-field-rawtextwithtokens > div > div[data-location-hours-prefix]'
          );
          console.log(operatingTable);
          if (operatingTable) operatingTable = operatingTable.innerHTML;
          return operatingTable;
        });

        const operating = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.form-group.ih-field-conditionalfield > ul > li',
          (item) => {
            let hours = [];
            item.forEach((item) => hours.push(item.innerText));
            return hours;
          }
        );

        const services = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > .ih-tab-1 > div',
          (item) => {
            let services = [];

            item.forEach((item) => {
              let serviceName = item.querySelectorAll(
                '.ih-field-services .ih-field-servicename > div'
              );
              if (serviceName) serviceName.forEach((service) => services.push(service.innerText));
            });

            return services;
          }
        );

        const amenities = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationamenities > div > ul > li',
          (item) => {
            let amenities = [];
            item.forEach((item) => amenities.push(item.innerText));
            return amenities;
          }
        );

        const education = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationeduprogcopy > div > ul > li',
          (item) => {
            let education = [];
            item.forEach((item) => education.push(item.innerText));
            return education;
          }
        );

        const pricing = await page.$eval('.ih-location-detail-middle', (i) => {
          let pricing = i.querySelector(
            'ih-static-zone div.pricing-not-empty > div.card > div.cta-card-btm > a'
          );
          if (pricing) pricing = pricing.href;
          return pricing;
        });

        const volunteer = await page.$eval('#ih-page-footer', (i) => {
          let volunteer = i.querySelector(
            'ih-tabbed-zone div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationvolunteeringcopy > div'
          );
          console.log(volunteer);
          if (volunteer) volunteer = volunteer.innerHTML;
          return volunteer;
        });

        const foundations = await page.$eval('#ih-page-footer', (i) => {
          let foundations = i.querySelector(
            'ih-tabbed-zone div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationfoundationcopy > div'
          );
          console.log(foundations);
          if (foundations) foundations = foundations.innerHTML;
          return foundations;
        });

        const PFAC = await page.$eval('#ih-page-footer', (i) => {
          let PFAC = i.querySelector(
            'ih-tabbed-zone div.tab-pane.ng-scope > div > div > div.ih-field-dynamiccol_locationpfacouncil > div'
          );
          if (PFAC) PFAC = PFAC.innerHTML;
          return PFAC;
        });

        const providers = await page.$$eval('#resultsWrapper_locationProviders > div', (item) => {
          return item.map((item) => {
            let imageSrc = item.querySelector('.card > img');
            let imageAlt = item.querySelector('.card > img');
            let name = item.querySelector('.card .prov-name');
            let gender = item.querySelector('.card[data-gender]');
            let phone = item.querySelector('.card .prov-phone');
            let specialty = item.querySelector('.card .prov-specialty');
            let location = item.querySelector('.card .prov-locations');
            let newPatients = item.querySelector('.card .prov-accept-new');
            let details = item.querySelector('.card a.btn.btn-primary');

            if (imageSrc) imageSrc = imageSrc.src;
            if (imageAlt) imageAlt = imageAlt.alt;
            if (name) name = name.innerText;
            if (gender) gender = gender.getAttribute('data-gender');
            if (phone) phone = phone.innerText;
            if (specialty) specialty = specialty.innerText;
            if (location) location = location.innerText;
            newPatients ? (newPatients = true) : (newPatients = false);
            if (details) details = details.href;

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

        const moreProviders = await page.$eval('#ih-page-footer', (i) => {
          let moreProviders = i.querySelector('.ih-location-providers #viewAllProviders');
          if (moreProviders) moreProviders = moreProviders.href;
          return moreProviders;
        });

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
            description,
            virtualTour,
            operatingBody,
            operatingTable,
            operating,
            services,
            amenities,
            education,
            pricing,
            volunteer,
            foundations,
            PFAC,
            providers,
            moreProviders,
          },
        });

        console.log('Locations Details', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(locationsContent, null, 2);
  fs.writeFile(
    './json/ProMedica/locations/locations-details.json',
    jsonArticlesContent,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nLocations Details Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
