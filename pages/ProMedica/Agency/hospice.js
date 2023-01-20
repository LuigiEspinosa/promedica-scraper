import fs from 'fs';
import { chromium } from 'playwright';

export default async function Hospice(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // {
  //   error: page.$eval: TypeError: Cannot read properties of null (reading 'src')
  //       at eval (eval at evaluate (:197:30), <anonymous>:12:16)
  //       at UtilityScript.evaluate (<anonymous>:199:17)
  //       at UtilityScript.<anonymous> (<anonymous>:1:44)
  //       at Hospice (file:///C:/Users/numcu/Documents/Axis/ProMedica/ProMedicaScraper/pages/ProMedica/Agency/hospice.js:81:42)
  // }

  // {
  //   error: page.click: Timeout 30000ms exceeded.
  //   =========================== logs ===========================
  //   waiting for locator('.hero-buttons-container > a.image-gallery')
  //   ============================================================
  //       at Hospice (file:///C:/Users/numcu/Documents/Axis/ProMedica/ProMedicaScraper/pages/ProMedica/Agency/hospice.js:19:20) {
  //     name: 'TimeoutError'
  //   }
  // }

  // * TODO: Get quote Content

  let hospiceDetaills = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();

        await page.waitForSelector('.hero-section');
        await page.click('.hero-buttons-container > a.image-gallery');

        const imgSrc = await page.$eval('#image-gallery', (i) => {
          let img = i.querySelector('#image-gallery .slick-slider img');
          if (img) img = img.src;
          return img;
        });

        const imgAlt = await page.$eval('#image-gallery', (i) => {
          let img = i.querySelector('#image-gallery .slick-slider img');
          if (img) img = img.alt;
          return img;
        });

        await page.click('img.image-gallery_close');

        const hospiceName = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-overlay > h2');
          if (content) content = content.innerText;
          return content;
        });

        const counties = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-overlay > p > strong');
          if (content && content.innerText === 'COUNTIES SERVED') {
            return (content = i.querySelector(
              '.hero-overlay > p:not(.no-margin) > strong'
            ).innerText);
          }
          return null;
        });

        const email = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-overlay a#email-link');
          if (content) content = content.innerText;
          return content;
        });

        const phone = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-overlay a#phone-link');
          if (content) content = content.innerText;
          return content;
        });

        const fax = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-overlay > p:not(.no-margin) > a');
          if (content) content = content.innerText;
          return content;
        });

        const title = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-copy > h1');
          if (content) content = content.innerText;
          return content;
        });

        const description = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-copy > p > span');
          if (content) content = content.innerText;
          return content;
        });

        const enrichingLife = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div.flex-row > div > section.grid-section > h2'
          );
          if (content && content.innerText === 'Enriching Life') {
            return (content = {
              content: i.querySelector(
                'main > .flex-wrapper > div.flex-row > div > section.grid-section > h2 + p'
              ).innerText,
              video: i.querySelector(
                'main > .flex-wrapper > div.flex-row > div > section.grid-section > figure > iframe'
              ).src,
            });
          }
          return null;
        });

        const patientServices = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2'
          );
          if (content && content.innerText === 'Patient Services') {
            return (content = {
              content: i.querySelector(
                'main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2 + p'
              ).innerText,
              learnMore: i.querySelector(
                'main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > a'
              ).href,
            });
          }
          return null;
        });

        const familySupport = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > h2'
          );
          if (content && content.innerText === 'Family Support') {
            return (content = {
              content: i.querySelector(
                'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > h2 + p'
              ).innerText,
              learnMore: i.querySelector(
                'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > a'
              ).href,
            });
          }
          return null;
        });

        const memorialFund = await page.$eval('main > .grid-row', (i) => {
          let content = i.querySelector(
            '.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2'
          );
          if (content && content.innerText === 'ProMedica Hospice Memorial Fund') {
            return (content = {
              content: i.querySelector(
                '.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2 + p'
              ).innerText,
              donate: i.querySelector(
                '.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > a'
              ).href,
            });
          }
          return null;
        });

        const testimonials = await page.$$eval(
          '.umb-grid section.grid-section div.testimonials > div',
          (item) => {
            return item.map((q) => {
              let quoteTitle = q.querySelector('div.testimonials > div > section > h3');
              let quote = q.querySelector('div.testimonials > div > section > blockquote');
              // let quotePopup = q.querySelector('div.testimonials > div > section > a');
              // let quoteContent;

              if (quoteTitle) quoteTitle = quoteTitle.innerText;
              if (quote) quote = quote.innerText;

              // if (quotePopup) {
              //   classname = quotePopup.classList.value;
              //   popup = classname.split('_open')[0];
              //   quotePopup.click();

              //   let popupContent = document.querySelector(`#${popup}_wrapper > #${popup} > article`);

              //   const close = document.querySelector(`a.${popup}_close`);
              //   close.click();

              //   if (popupContent) quoteContent = popupContent.innerHTML;
              // }

              return {
                quoteTitle,
                quote,
                // quoteContent,
              };
            });
          }
        );

        const moreInfo = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'body > main > div:nth-child(10) > div > div.col.span6.background-color-gray.vertical-alignment-center > section > a'
          );
          if (content) content = content.href;
          console.log(content);
          return content;
        });

        const contact = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'body > main > div:nth-child(10) > div > div.col.span6.background-color-blue-dark.item-padding-large.horizontal-alignment-center > section > a'
          );
          if (content) content = content.href;
          console.log(content);
          return content;
        });

        hospiceDetaills.push({
          id: i + 1,
          title: articlesTitle,
          url: links[i],
          content: {
            imgSrc,
            imgAlt,
            hospiceName,
            counties,
            email,
            phone,
            fax,
            title,
            description,
            enrichingLife,
            patientServices,
            familySupport,
            memorialFund,
            testimonials,
            moreInfo,
            contact,
          },
        });

        console.log('Hospice', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonHospiceDetaills = JSON.stringify(hospiceDetaills, null, 2);
  fs.writeFile(
    './json/ProMedica/agency/hospice-details.json',
    jsonHospiceDetaills,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nHospice Details Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
