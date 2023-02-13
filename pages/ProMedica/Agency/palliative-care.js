import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function PalliativeCare(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let palliativeCare = [];
  let externalVideos = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();
        let subpageTitle, menuLink;

        await page.waitForSelector('.hero-section');

        const banner = await page.locator('.hero-buttons-container > a[data-popup-ordinal="0"]').getByText('Photo Gallery').isVisible();

        let imgSrc, imgAlt;
        if (banner) {
          await page.click('.hero-buttons-container > a.image-gallery');

          imgSrc = await page.$eval('#image-gallery', (i) => i.querySelector('#image-gallery .slick-slider img')?.src || null);
          imgAlt = await page.$eval('#image-gallery', (i) => i.querySelector('#image-gallery .slick-slider img')?.alt || null);

          await page.keyboard.press('Escape');
        }

        const hospiceName = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > h2')?.innerText || null);

        const counties = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-overlay > p > strong');
          if (content && content?.innerText === 'COUNTIES SERVED') {
            return (content = i.querySelector('.hero-overlay > p:not(.no-margin) > strong')?.innerText || null);
          }
          return null;
        });

        const email = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#email-link')?.innerText || null);

        const phone = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#phone-link')?.innerHTML || null);

        const fax = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > p:not(.no-margin) > a')?.innerText || null);

        const title = await page.$eval('.hero-section', (i) => i.querySelector('.hero-copy > h1')?.innerText || null);

        const description = await page.$eval(
          '.hero-section',
          (i) => i.querySelector('.hero-copy > h1 + *')?.innerHTML || i.querySelector('.hero-copy > h1 + *')?.innerHTML || null
        );

        let improvingLife = await page.$eval('main', (i) => {
          let content = i.querySelector('body > main > div:nth-child(7) > div > div:nth-child(1) > section > h2');

          if (content && content?.innerText === 'Improving Quality of Life') {
            return (content = {
              content: i.querySelector('body > main > div:nth-child(7) > div > div:nth-child(2) > section > h2 + p')?.innerText || null,
              learnMore: i.querySelector('body > main > div:nth-child(7) > div > div:nth-child(2) > section > a')?.href || null,
            });
          }

          return null;
        });

        let patientServices = await page.$eval('main', (i) => {
          let content = i.querySelector('body > main > div:nth-child(7) > div > div:nth-child(2) > section > h2');

          if (content && content?.innerText === 'Patient Services') {
            return (content = {
              content: i.querySelector('body > main > div:nth-child(7) > div > div:nth-child(2) > section > h2 + p')?.innerText || null,
              learnMore: i.querySelector('body > main > div:nth-child(7) > div > div:nth-child(2) > section > a')?.href || null,
            });
          }

          return null;
        });

        if (hospiceName === 'ProMedica Palliative Care Serving St. Louis') {
          improvingLife = await page.$eval('main', (i) => {
            let content = i.querySelector('body > main > div:nth-child(5) > div > div:nth-child(1) > section > h2');

            if (content && content?.innerText === 'Improving Quality of Life') {
              return (content = {
                content: i.querySelector('body > main > div:nth-child(5) > div > div:nth-child(2) > section > h2 + p')?.innerText || null,
                learnMore: i.querySelector('body > main > div:nth-child(5) > div > div:nth-child(2) > section > a')?.href || null,
              });
            }

            return null;
          });

          patientServices = await page.$eval('main', (i) => {
            let content = i.querySelector('body > main > div:nth-child(5) > div > div:nth-child(2) > section > h2');

            if (content && content?.innerText === 'Patient Services') {
              return (content = {
                content: i.querySelector('body > main > div:nth-child(5) > div > div:nth-child(2) > section > h2 + p')?.innerText || null,
                learnMore: i.querySelector('body > main > div:nth-child(5) > div > div:nth-child(2) > section > a')?.href || null,
              });
            }

            return null;
          });
        }

        // External Videos
        let videos = await page.$eval('main', (i) => i.querySelector('iframe[src*="vidyard"]')?.src);
        externalVideos.push(videos);

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=What is Palliative Care"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let whatIs = [];
        if (subpageTitle.includes('What is')) {
          const whatIsDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const benefits = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                )?.innerText || null,
              content:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2 + *'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          const eligible = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > h2'
                )?.innerText || null,
              content:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > h2 + *'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          const different = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector('div.grid-row > div.configured-Centered > div.flex-row > div.span8 > section.grid-section > h2')
                  ?.innerText || null,
              content:
                i.querySelector('div.grid-row > div.configured-Centered > div.flex-row > div.span8 > section.grid-section > h2 + p')
                  ?.innerText || null,
              button:
                i.querySelector('div.grid-row > div.configured-Centered > div.flex-row > div.span8 > section.grid-section > p > a')?.href ||
                null,
            };
          });

          whatIs.push({
            whatIsDescription: sanitize(whatIsDescription),
            benefits,
            eligible,
            different,
          });

          // External Videos
          videos = await page.$eval('main', (i) => i.querySelector('iframe[src*="vidyard"]')?.src);
          externalVideos.push(videos);
        }

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=Patient Services"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let patient = [];
        if (subpageTitle.includes('Patient')) {
          const patientDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const goals = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > h2'
                )?.innerText || null,
              content:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > h2 + *'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          const symptoms = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-0C466C > section.grid-section > ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-0C466C > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-0C466C > section.grid-section > figure > img'
                )?.alt || null,
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-0C466C > section.grid-section > h2'
                )?.innerText || null,
              list,
            };
          });

          const services = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-row > div.configured-2-Column > div.flex-row > div:not(.background-color-0C466C) > section.grid-section > ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div:not(.background-color-F8F8F5) > section.grid-section > h2'
                )?.innerText || null,
              list,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          patient.push({
            patientDescription: sanitize(patientDescription),
            goals,
            symptoms,
            services,
          });

          // External Videos
          videos = await page.$eval('main', (i) => i.querySelector('iframe[src*="vidyard"]')?.src);
          externalVideos.push(videos);
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Stories"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let stories = [];
        if (subpageTitle.includes('Stories')) {
          const storiesDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const words = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > h2'
                )?.innerText || null,
              content:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > h2 + *'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          stories.push({
            storiesDescription: sanitize(storiesDescription),
            words,
          });

          // External Videos
          videos = await page.$eval('main', (i) => i.querySelector('iframe[src*="vidyard"]')?.src);
          externalVideos.push(videos);
        }

        const moreInfo = await page.$eval(
          'main',
          (i) => i.querySelector('main > div:last-of-type > div > div:nth-child(1) > section > a')?.href || null
        );

        const contact = await page.$eval(
          'main',
          (i) => i.querySelector('main > div:last-of-type > div > div:nth-child(2) > section > a')?.href || null
        );

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Contact Us"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let contactForm = null;
        if (subpageTitle.includes('Contact')) {
          contactForm = await page.$eval(
            'section.grid-section',
            () =>
              document
                .evaluate('//div[starts-with(@id,"umbraco_form")]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
                .snapshotItem(0)?.innerHTML || null
          );
        }

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
            whatIs,
            patient,
            stories,
            moreInfo,
            contact,
            // contactForm,
          },
        });

        console.log('Palliative Care', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonPalliativeCare = JSON.stringify(palliativeCare, null, 2);
  fs.writeFile('./json/ProMedica/agency/palliative-care-details.json', jsonPalliativeCare, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nPalliative Care Details Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
