import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function HomeHealth(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let homeHealth = [];
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

        const phone = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#phone-link')?.innerText || null);

        const fax = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > p:not(.no-margin) > a')?.innerText || null);

        const title = await page.$eval('.hero-section', (i) => i.querySelector('.hero-copy > h1')?.innerText || null);

        const description = await page.$eval(
          '.hero-section',
          (i) => i.querySelector('.hero-copy > h1 + *')?.innerHTML || i.querySelector('.hero-copy > h1 + *')?.innerHTML || null
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

        const patientServices = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2');
          if (content && content?.innerText === 'Patient Services') {
            return (content = {
              content:
                i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2 + p')?.innerText || null,
              learnMore: i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > a')?.href || null,
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

        await page.$$eval('.umb-grid section.grid-section div.testimonials > div', (item) => {
          return item.map((q) => {
            const quoteContent = q.querySelector('div.testimonials > div > section > a');
            if (quoteContent) quoteContent.click();
          });
        });

        let testimonials = await page.$$eval('.umb-grid section.grid-section div.testimonials > div', (item) => {
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

        testimonials = testimonials.map((item) => {
          return {
            quoteTitle: item.quoteTitle,
            quote: item.quote,
            quoteContent: sanitize(item.quoteContent),
          };
        });

        for (let i = 0; i < testimonials?.length; i++) {
          await page.keyboard.press('Escape');
        }

        // External Videos
        let videos = await page.$eval('main', (i) => i.querySelector('iframe[src*="vidyard"]')?.src);
        externalVideos.push(videos);

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=What Is Home Health Care"]')?.href || null
        );

        if (menuLink !== null) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let whatIs = [];
        if (subpageTitle?.includes('What Is')) {
          const whatIsDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const bestOf = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-2-Column > div.flex-row > ';

            let list = [];
            const li = i.querySelectorAll(
              `${root} div:not(.background-color-FFFFFF, .background-color-F8F8F5).content-section-Yes > section.grid-section > ul > li`
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              image: i.querySelector(`${root} div.background-color-DFEAEB > section.grid-section > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} div.background-color-DFEAEB > section.grid-section > figure > img`)?.alt || null,
              title: i.querySelector(`${root} div.content-section-Yes > section.grid-section > h2`)?.innerText || null,
              list,
            };
          });

          const whoIs = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > p'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.alt || null,
              list,
            };
          });

          const consider = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section .bordered-content-inner ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2 + *'
                )?.innerHTML || null,
              list,
            };
          });

          let myths = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > ul > li'
            );

            li.forEach((item) =>
              list.push({
                header: item.querySelector('div.toggle-title > h3')?.innerText || null,
                content: item.querySelector('div.toggle-inner')?.textContent || null,
              })
            );

            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > p'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                )?.alt || null,
              list,
            };
          });

          myths = {
            title: myths.title,
            description: myths.description,
            image: myths.image,
            imageAlt: myths.imageAlt,
            list: myths.list.map((item) => {
              return {
                header: item.header,
                content: sanitize(item.content),
              };
            }),
          };

          const payment = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes.background-color-DFEAEB';

            return {
              title: i.querySelector(`${root} > section.grid-section > h2`)?.innerText || null,
              description: i.querySelector(`${root} > section.grid-section > p`)?.innerText || null,
              image: i.querySelector(`${root} + div.background-color-DFEAEB > section.grid-section > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} + div.background-color-DFEAEB > section.grid-section > figure > img`)?.alt || null,
            };
          });

          whatIs.push({
            whatIsDescription: sanitize(whatIsDescription),
            bestOf,
            whoIs,
            consider,
            myths,
            payment,
          });

          // External Videos
          videos = await page.$eval('main', (i) => i.querySelector('iframe[src*="vidyard"]')?.src);
          externalVideos.push(videos);
        }

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
            description: sanitize(description),
            enrichingLife,
            patientServices,
            ourTeam,
            testimonials,
            whatIs,
            moreInfo,
            contact,
            // contactForm,
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

  const jsonExternalVideos = JSON.stringify(externalVideos, null, 2);
  fs.writeFile('./json/ProMedica/agency/Video/home-health-videos.json', jsonExternalVideos, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nExternal Videos Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
