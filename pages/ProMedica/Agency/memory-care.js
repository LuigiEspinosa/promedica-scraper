import fs from 'fs';
import { chromium } from 'playwright';

export default async function MemoryCare(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let memoryCareDetails = [];
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

        const vTourButton = await page
          .locator('.hero-buttons-container > a[href*="https:"]')
          .getByText('Virtual Tour')
          .first()
          .isVisible();

        const testimonialsButton = await page
          .locator('.hero-buttons-container > a.testimonialVideoOverlay_open')
          .getByText('Testimonials')
          .first()
          .isVisible();

        const vEventsButton = await page
          .locator('.hero-buttons-container > a.button')
          .getByText('Virtual Events')
          .first()
          .isVisible();

        let photoGallery;
        if (banner) {
          await page.click('.hero-buttons-container > a.image-gallery');

          photoGallery = await page.$$eval(
            '#image-gallery section.image-gallery-container .slick-list .slick-track .slick-slide > img',
            (item) => {
              let images = [];
              item.forEach((item) => images.push({ imgSrc: item.src, imgAlt: item.alt }));
              return images;
            }
          );

          await page.keyboard.press('Escape');
        }

        let virtualTour;
        if (vTourButton) {
          virtualTour = await page
            .locator('.hero-buttons-container > a[href*="https:"]')
            .getByText('Virtual Tour')
            .first()
            .getAttribute('href');
        }

        let testimonialsVideo;
        if (testimonialsButton) {
          await page.click('.hero-buttons-container > a.testimonialVideoOverlay_open');

          testimonialsVideo = await page.$eval('#testimonialVideoOverlay', (i) => {
            let video = i.querySelector('#testimonialVideoOverlay iframe');
            if (video) video = video.src;
            return video;
          });

          await page.keyboard.press('Escape');
        }

        let virtualEvents;
        if (vEventsButton) {
          virtualEvents = await page
            .locator('.hero-buttons-container > a.button')
            .getByText('Virtual Events')
            .first()
            .getAttribute('href');
        }

        const hospiceName = await page.$eval('.hero-section', (i) => {
          let content = i.querySelector('.hero-overlay > h2');
          if (content) content = content.innerText;
          return content;
        });

        const address = await page.$eval('.hero-section', (item) => {
          let address1 = item.querySelector('.hero-overlay p:not(.hero-map-link)');
          let address2 = item.querySelector('.hero-overlay p.hero-map-link');
          let directions = item.querySelector('.hero-overlay p.directions > a[href*="http"]');

          if (address1) address1 = address1.innerText;
          if (address2) address2 = address2.innerText;
          if (directions) directions = directions.href;

          return {
            address1,
            address2,
            directions,
          };
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

        const customizedCare = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2'
          );
          if (content && content.innerText === 'Customized Care & Services') {
            return (content = {
              content:
                i.querySelector(
                  'main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2 + p'
                ).innerText || null,
              learnMore:
                i.querySelector(
                  'main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > a'
                ).href || null,
            });
          }
          return null;
        });

        const designLayout = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div.background-color-white > section.content-section > h2'
          );
          if (content && content.innerText === 'Design & Layout') {
            return (content = {
              content:
                i.querySelector(
                  'main > .flex-wrapper > div:not(.flex-row) > div.background-color-white > section.content-section > h2 + p'
                ).innerText || null,
              learnMore:
                i.querySelector(
                  'main > .flex-wrapper > div:not(.flex-row) > div.background-color-white > section.content-section > a'
                ).href || null,
            });
          }
          return null;
        });

        await page.$$eval('.umb-grid section.grid-section div.testimonials > div', (item) => {
          return item.map((q) => {
            const quoteContent = q.querySelector('div.testimonials > div > section > a');
            if (quoteContent) quoteContent.click();
          });
        });

        const testimonials = await page.$$eval(
          '.umb-grid section.grid-section div.testimonials > div',
          (item) => {
            return item.map((q) => {
              let quoteTitle = q.querySelector('div.testimonials > div > section > h3');
              let quote = q.querySelector('div.testimonials > div > section > blockquote');
              let quoteContent = q.querySelector('div.testimonials > div > section > a');

              if (quoteTitle) quoteTitle = quoteTitle.innerText;
              if (quote) quote = quote.innerText;

              if (quoteContent) {
                classname = quoteContent.classList.value;
                popup = classname.split('_open')[0];

                const article = document.querySelector(`#${popup}_wrapper > #${popup} > article`);
                if (article) quoteContent = article.innerHTML;
              }

              return {
                quoteTitle,
                quote,
                quoteContent,
              };
            });
          }
        );

        const memorialFund = await page.$eval('main > .grid-row', (i) => {
          let content = i.querySelector(
            '.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2'
          );
          if (content && content.innerText === 'ProMedica Memory Care Fund') {
            return (content = {
              content:
                i.querySelector(
                  '.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2 + p'
                ).innerText || null,
              donate:
                i.querySelector(
                  '.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > a'
                ).href || null,
            });
          }
          return null;
        });

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

        memoryCareDetails.push({
          id: i + 1,
          title: articlesTitle,
          url: links[i],
          content: {
            photoGallery,
            virtualTour,
            testimonialsVideo,
            virtualEvents,
            hospiceName,
            address,
            email,
            phone,
            fax,
            title,
            description,
            customizedCare,
            designLayout,
            testimonials,
            memorialFund,
            moreInfo,
            contact,
          },
        });

        console.log('Memory Care', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonMemoryCareDetaills = JSON.stringify(memoryCareDetails, null, 2);
  fs.writeFile(
    './json/ProMedica/agency/memory-care-details.json',
    jsonMemoryCareDetaills,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nMemory Care Details Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
