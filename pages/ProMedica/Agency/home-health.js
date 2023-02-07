import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function HomeHealth(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let homeHealth = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();
        let subpageTitle;

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

        const phone = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#phone-link')?.innerText || null);

        const fax = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > p:not(.no-margin) > a')?.innerText || null);

        const title = await page.$eval('.hero-section', (i) => i.querySelector('.hero-copy > h1')?.innerText || null);

        const description = await page.$eval(
          '.hero-section',
          (i) => i.querySelector('.hero-copy > p > span')?.innerText || i.querySelector('.hero-copy > p')?.innerText || null
        );

        const enrichingLife = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector('main > .flex-wrapper > div.flex-row > div > section.grid-section > h2');

          if (content && content?.innerText === 'Enriching Life') {
            let content = i.querySelector('main > .flex-wrapper > div.flex-row > div > section.grid-section > h2 + p')?.innerText || null;
            let video = i.querySelector('main > .flex-wrapper > div.flex-row > div > section.grid-section > figure iframe')?.src || null;
            let imageSrc = i.querySelector('main > .flex-wrapper > div.flex-row > div > section.grid-section > figure img')?.src || null;
            let imageAlt = i.querySelector('main > .flex-wrapper > div.flex-row > div > section.grid-section > figure img')?.alt || null;

            return (content = {
              content: content,
              video: video,
              imageSrc: imageSrc,
              imageAlt: imageAlt,
            });
          }

          return null;
        });

        const ourServices = await page.$eval('main > .umb-grid', (i) => {
          let content = i.querySelector('main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section > h2');

          if (content && content?.innerText === 'Our Services') {
            let content =
              i.querySelector('main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section')?.innerHTML ||
              null;
            let imageSrc =
              i.querySelector('main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section figure > img')
                ?.src || null;
            let imageAlt =
              i.querySelector('main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section figure > img')
                ?.alt || null;

            return (content = {
              content: content,
              imageSrc: imageSrc,
              imageAlt: imageAlt,
            });
          }

          return null;
        });

        const patientServices = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2');
          if (content && content?.innerText === 'Patient Services') {
            return (content = {
              content:
                i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2 + p').innerText || null,
              learnMore: i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > a').href || null,
            });
          }
          return null;
        });

        const ourTeam = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > h2'
          );
          if (content && content?.innerText === 'Our Team') {
            return (content = {
              content:
                i.querySelector(
                  'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > h2 + p'
                )?.innerText || null,
              learnMore:
                i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > a')
                  ?.href || null,
            });
          }
          return null;
        });

        const HowCanHelp = await page.$eval('main > .umb-grid', (i) => {
          let content =
            i.querySelector(
              'main > .umb-grid .pattern-0C466C .flex-wrapper.configured-2-Column .flex-row > div.content-section-Yes > section.grid-section'
            )?.innerHTML || null;
          let imageSrc =
            i.querySelector(
              'main > .umb-grid .pattern-0C466C .flex-wrapper.configured-2-Column .flex-row > div > section.grid-section figure > img'
            )?.src || null;
          let imageAlt =
            i.querySelector(
              'main > .umb-grid .pattern-0C466C .flex-wrapper.configured-2-Column .flex-row > div > section.grid-section figure > img'
            )?.alt || null;

          return {
            content: content,
            imageSrc: imageSrc,
            imageAlt: imageAlt,
          };
        });

        await page.$$eval('.umb-grid section.grid-section div.testimonials > div', (item) => {
          return item.map((q) => {
            const quoteContent = q.querySelector('div.testimonials > div > section > a');
            if (quoteContent) quoteContent.click();
          });
        });

        const testimonials = await page.$$eval('.umb-grid section.grid-section div.testimonials > div', (item) => {
          return item.map((q) => {
            let quoteTitle = q.querySelector('div.testimonials > div > section > h3')?.innerText || null;
            let quote = q.querySelector('div.testimonials > div > section > blockquote')?.innerText || null;
            let quoteContent = q.querySelector('div.testimonials > div > section > a');

            if (quoteContent) {
              classname = quoteContent.classList.value;
              popup = classname.split('_open')[0];
              quoteContent = document.querySelector(`#${popup}_wrapper > #${popup} > article`)?.innerHTML || null;
            }

            return {
              quoteTitle,
              quote,
              quoteContent,
            };
          });
        });

        const moreInfo = await page.$eval(
          'main',
          (i) => i.querySelector('main > div:last-of-type > div > div:nth-child(1) > section > a')?.href || null
        );

        const contact = await page.$eval(
          'main',
          (i) => i.querySelector('main > div:last-of-type > div > div:nth-child(2) > section > a')?.href || null
        );

        homeHealth.push({
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
            ourServices,
            patientServices,
            ourTeam,
            HowCanHelp,
            testimonials,
            moreInfo,
            contact,
          },
        });

        console.log('Home Health', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonHomeHealth = JSON.stringify(homeHealth, null, 2);
  fs.writeFile('./json/ProMedica/agency/home-health-details.json', jsonHomeHealth, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nHome Health Details Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
