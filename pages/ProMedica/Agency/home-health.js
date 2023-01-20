import fs from 'fs';
import { chromium } from 'playwright';

export default async function HomeHealth(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let homeHealth = [];
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

        const enrichingLife = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div.flex-row > div > section.grid-section > h2'
          );

          if (content && content.innerText === 'Enriching Life') {
            let content = i.querySelector(
              'main > .flex-wrapper > div.flex-row > div > section.grid-section > h2 + p'
            );
            let video = i.querySelector(
              'main > .flex-wrapper > div.flex-row > div > section.grid-section > figure iframe'
            );
            let imageSrc = i.querySelector(
              'main > .flex-wrapper > div.flex-row > div > section.grid-section > figure img'
            );
            let imageAlt = i.querySelector(
              'main > .flex-wrapper > div.flex-row > div > section.grid-section > figure img'
            );

            if (content) content = content.innerText;
            if (video) video = video.src;
            if (imageSrc) imageSrc = imageSrc.src;
            if (imageAlt) imageAlt = imageAlt.alt;

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
          let content = i.querySelector(
            'main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section > h2'
          );

          if (content && content.innerText === 'Our Services') {
            let content = i.querySelector(
              'main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section'
            );
            let imageSrc = i.querySelector(
              'main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section figure > img'
            );
            let imageAlt = i.querySelector(
              'main > .umb-grid .flex-wrapper.configured-2-Column > .flex-row > div > section.grid-section figure > img'
            );

            if (content) content = content.innerHTML;
            if (imageSrc) imageSrc = imageSrc.src;
            if (imageAlt) imageAlt = imageAlt.alt;

            return (content = {
              content: content,
              imageSrc: imageSrc,
              imageAlt: imageAlt,
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

        const ourTeam = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > h2'
          );
          if (content && content.innerText === 'Our Team') {
            return (content = {
              content:
                i.querySelector(
                  'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > h2 + p'
                ).innerText || null,
              learnMore:
                i.querySelector(
                  'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > a'
                ).href || null,
            });
          }
          return null;
        });

        const HowCanHelp = await page.$eval('main > .umb-grid', (i) => {
          let content = i.querySelector(
            'main > .umb-grid .pattern-0C466C .flex-wrapper.configured-2-Column .flex-row > div.content-section-Yes > section.grid-section'
          );
          let imageSrc = i.querySelector(
            'main > .umb-grid .pattern-0C466C .flex-wrapper.configured-2-Column .flex-row > div > section.grid-section figure > img'
          );
          let imageAlt = i.querySelector(
            'main > .umb-grid .pattern-0C466C .flex-wrapper.configured-2-Column .flex-row > div > section.grid-section figure > img'
          );

          if (content) content = content.innerHTML;
          if (imageSrc) imageSrc = imageSrc.src;
          if (imageAlt) imageAlt = imageAlt.alt;

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
  fs.writeFile(
    './json/ProMedica/agency/home-health-details.json',
    jsonHomeHealth,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nHome Health Details Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
