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

      console.log('Locations Page', i, 'out of', totalPages, 'Done');
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
  fs.writeFile('./json/locations/locations.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nLocations Imported!\n');
  });

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
              const addressOne = location.querySelector('p:first-child').innerText;
              const addressTwo = location.querySelector('p:last-child').innerText;

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

        const description = await page.$eval('ih-static-zone', (i) => {
          let description = i.querySelector('.form-group.ih-field-locationdescription');
          if (description) description = description.innerHTML;
          return description;
        });

        const operating = await page.$$eval(
          'ih-tabbed-zone > div > div > div.tab-pane.ng-scope.active > div > div > div.form-group.ih-field-conditionalfield > ul > li',
          (item) => {
            let hours = [];

            item.forEach((item) => {
              hours.push(item.innerText);
            });

            return hours;
          }
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
            description,
            operating,
          },
        });

        console.log('Locations Details', i + 1, 'out of', mergeLinks.length, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(locationsContent, null, 2);
  fs.writeFile('./json/locations/locations-details.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nLocations Details Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
