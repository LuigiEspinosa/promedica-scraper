import fs from 'fs';
import { chromium } from 'playwright';

export default async function ServicesConditions() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/services-and-conditions/', {
    waitUntil: 'domcontentloaded',
  });

  const alphabeticalSelectors = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  const totalSelectors = alphabeticalSelectors.length - 1;

  let servicesConditions = [];
  for (let i = 0; i <= totalSelectors; i++) {
    try {
      if (i === 0) {
        await page.click('#select_A');
      }

      await page.waitForSelector('#resultsWrapper_serviceSearchResults');

      const servicesCards = await page.$$eval(
        '#resultsWrapper_serviceSearchResults > div',
        (cardItem) => {
          return cardItem.map((card) => {
            let name = card.querySelector('.service-text .service-name');
            let description = card.querySelector('.service-text .service-desc > div > p > span');
            let providers = card.querySelector(
              '.service-text .service-links > a[href*="/find-a-doctor"]'
            );
            let locations = card.querySelector(
              '.service-text .service-links > a[href*="/find-locations"]'
            );
            let details = card.querySelector('a.btn.btn-primary');

            if (name) name = name.innerText;
            if (description) description = description.innerText;
            if (providers) providers = providers.href;
            if (locations) locations = locations.href;
            if (details) details = details.href;

            return {
              name,
              description,
              providers,
              locations,
              details,
            };
          });
        }
      );

      if (i < totalSelectors) {
        await page.click(`#select_${alphabeticalSelectors[i + 1]}`);
      }

      servicesConditions.push({
        id: alphabeticalSelectors[i],
        services: servicesCards,
      });

      console.log('Services & Conditions Page', i + 1, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const jsonServicesConditions = JSON.stringify(servicesConditions, null, 2);
  fs.writeFile(
    './json/ProMedica/services-conditions/services-conditions.json',
    jsonServicesConditions,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nServices & Conditions Imported!\n');
    }
  );

  // Press Release content
  const eachItem = servicesConditions.map((item) => item.services);
  const mergeItems = [...new Set([].concat(...eachItem.map((item) => item)))];

  const mergeLinks = mergeItems.map((item) => {
    if (item.details !== null && item.details.startsWith('https://www.promedica.org/')) {
      return item.details;
    }
  });

  let servicesBody = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();

        const articleContent = await page.$eval('#ih-page-body', (i) => {
          let content = i.querySelector('.row > div');
          if (content) content = content.innerHTML;
          return content;
        });

        servicesBody.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          content: articleContent,
        });

        console.log('Services & Conditions Article', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(servicesBody, null, 2);
  fs.writeFile(
    './json/ProMedica/services-conditions/services-conditions-articles.json',
    jsonArticlesContent,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nServices & Conditions Articles Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
