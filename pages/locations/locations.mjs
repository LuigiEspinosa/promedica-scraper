import fs from 'fs'
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.promedica.org/find-locations/location-results",
    { waitUntil: 'domcontentloaded' }
  );

  const root = "#location_PublicListView_searchresults > div >"


  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`);
  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-last.ng-scope > a`);

  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`);
  const numberPages = await page.$$eval(`${root} div:nth-child(4) > div > div > ul > li.pagination-page.ng-scope.active > a`, (numberpages) => {
    return numberpages.map((numberPage) => {
      return parseInt(numberPage.innerText);
    });
  });

  const totalPages = Math.max(...numberPages.filter((p) => !isNaN(p)));

  await page.waitForSelector(`${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`);
  await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-first.ng-scope > a`);

  let locations = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector(`${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`);

      const locationsPerPage = await page.$$eval(
        `${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`,
        (itemLocation) => {
          return itemLocation.map((location) => {
            const title = location.querySelector(".ih-field-locationname > div").innerText;
            const linkSrc = location.querySelector(".form-group a.btn.btn-primary").href;
            const linkText = location.querySelector(".form-group a.btn.btn-primary").innerText;
            
            let addressOne = location.querySelector(".ih-field-locationaddress .locationaddress-one");
            let addressTwo = location.querySelector(".ih-field-locationaddress .locationaddress-two");
            let phone = location.querySelector(".ih-field-locationphone > a");

            if (addressOne) addressOne = addressOne.innerText
            if (addressTwo) addressTwo = addressTwo.innerText
            if (phone) phone = phone.innerText

            return {
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

      locations.push({
        site: 'Locations',
        page: i,
        locations: locationsPerPage,
      });

      console.log('Locations Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const jsonContent = JSON.stringify(locations, null, 2)
  fs.writeFile("./json/locations/locations.json", jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("Locations Imported!");
  });

  // close page and browser
  await page.close();
  await browser.close();
})();
