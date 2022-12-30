import fs from 'fs'
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.promedica.org/find-a-doctor/provider-results",
    { waitUntil: 'domcontentloaded' }
  );

  const root = "#provider_PublicListView_searchresults > div >"

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

  let doctors = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector(`${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`);

      const doctorsPerPage = await page.$$eval(
        `${root} div:nth-child(3) > div > div > div > div > div > div > div.tab-pane.ng-scope.active > div > div.ih-tab-list div.row.ng-scope`,
        (itemDoctors) => {
          return itemDoctors.map((doctor) => {
            const imgSrc = doctor.querySelector(".ih-field-providerimage img").src;
            const imgText = doctor.querySelector(".ih-field-providerimage img").alt;
            const name = doctor.querySelector(".ih-field-providernamelink .doctor-name-link > a").innerText;
            const linkSrc = doctor.querySelector(".form-group .view-profile-btn:not(mychart-appointment__button) a.btn.btn-primary").href;
            const linkText = doctor.querySelector(".form-group .view-profile-btn:not(mychart-appointment__button) a.btn.btn-primary").innerText;
            
            let specialty = doctor.querySelector(".ih-field-primaryspecialty > div");
            let location = doctor.querySelector(".form-group > .primary-location");
            let phone = doctor.querySelector(".ih-field-primaryphone > div > a");

            if (specialty) specialty = specialty.innerText
            if (location) location = location.innerText
            if (phone) phone = phone.innerText

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
        await page.click(`${root} div:nth-child(4) > div > div > ul > li.pagination-next.ng-scope > a`);
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

  const jsonContent = JSON.stringify(doctors, null, 2)
  fs.writeFile("./json/doctors/doctors.json", jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("\nDoctors Imported!\n");
  });

  // close page and browser
  await page.close();
  await browser.close();
})();
