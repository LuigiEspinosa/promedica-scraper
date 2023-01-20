import fs from 'fs';
import { chromium } from 'playwright';

export default async function PalliativeCare(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let palliativeCare = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();

        await page.waitForSelector('.hero-section');

        const banner = await page
          .locator('.hero-buttons-container > a[data-popup-ordinal="0"]')
          .getByText('Photo Gallery')
          .isVisible();

        let imgSrc, imgAlt;
        if (banner) {
          await page.click('.hero-buttons-container > a.image-gallery');

          imgSrc = await page.$eval('#image-gallery', (i) => {
            let img = i.querySelector('#image-gallery .slick-slider img');
            if (img) img = img.src;
            return img;
          });

          imgAlt = await page.$eval('#image-gallery', (i) => {
            let img = i.querySelector('#image-gallery .slick-slider img');
            if (img) img = img.alt;
            return img;
          });

          await page.keyboard.press('Escape');
        }

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
          let content =
            i.querySelector('.hero-copy > p > span') || i.querySelector('.hero-copy > p');
          if (content) content = content.innerText;
          return content;
        });

        let improvingLife = await page.$eval('main', (i) => {
          let content = i.querySelector(
            'body > main > div:nth-child(7) > div > div:nth-child(1) > section > h2'
          );

          if (content && content.innerText === 'Improving Quality of Life') {
            return (content = {
              content:
                i.querySelector(
                  'body > main > div:nth-child(7) > div > div:nth-child(2) > section > h2 + p'
                ).innerText || null,
              learnMore:
                i.querySelector(
                  'body > main > div:nth-child(7) > div > div:nth-child(2) > section > a'
                ).href || null,
            });
          }

          return null;
        });

        let patientServices = await page.$eval('main', (i) => {
          let content = i.querySelector(
            'body > main > div:nth-child(7) > div > div:nth-child(2) > section > h2'
          );

          if (content && content.innerText === 'Patient Services') {
            return (content = {
              content:
                i.querySelector(
                  'body > main > div:nth-child(7) > div > div:nth-child(2) > section > h2 + p'
                ).innerText || null,
              learnMore:
                i.querySelector(
                  'body > main > div:nth-child(7) > div > div:nth-child(2) > section > a'
                ).href || null,
            });
          }

          return null;
        });

        if (hospiceName === 'ProMedica Palliative Care Serving St. Louis') {
          improvingLife = await page.$eval('main', (i) => {
            let content = i.querySelector(
              'body > main > div:nth-child(5) > div > div:nth-child(1) > section > h2'
            );

            if (content && content.innerText === 'Improving Quality of Life') {
              return (content = {
                content:
                  i.querySelector(
                    'body > main > div:nth-child(5) > div > div:nth-child(2) > section > h2 + p'
                  ).innerText || null,
                learnMore:
                  i.querySelector(
                    'body > main > div:nth-child(5) > div > div:nth-child(2) > section > a'
                  ).href || null,
              });
            }

            return null;
          });

          patientServices = await page.$eval('main', (i) => {
            let content = i.querySelector(
              'body > main > div:nth-child(5) > div > div:nth-child(2) > section > h2'
            );

            if (content && content.innerText === 'Patient Services') {
              return (content = {
                content:
                  i.querySelector(
                    'body > main > div:nth-child(5) > div > div:nth-child(2) > section > h2 + p'
                  ).innerText || null,
                learnMore:
                  i.querySelector(
                    'body > main > div:nth-child(5) > div > div:nth-child(2) > section > a'
                  ).href || null,
              });
            }

            return null;
          });
        }

        const moreInfo = await page.$eval('main', (i) => {
          let content = i.querySelector(
            'main > div:last-of-type > div > div:nth-child(1) > section > a'
          );
          if (content) content = content.href;
          return content;
        });

        const contact = await page.$eval('main', (i) => {
          let content = i.querySelector(
            'main > div:last-of-type > div > div:nth-child(2) > section > a'
          );
          if (content) content = content.href;
          return content;
        });

        palliativeCare.push({
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
            improvingLife,
            patientServices,
            moreInfo,
            contact,
          },
        });

        console.log('Palliative Care', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonPalliativeCare = JSON.stringify(palliativeCare, null, 2);
  fs.writeFile(
    './json/ProMedica/agency/palliative-care-details.json',
    jsonPalliativeCare,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nPalliative Care Details Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
