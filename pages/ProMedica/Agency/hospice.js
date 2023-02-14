import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function Hospice(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let hospiceDetaills = [];
  let externalVideos = [];
  let hospiceImages = [];
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
            return (content = {
              content: i.querySelector('main > .flex-wrapper > div.flex-row > div > section.grid-section > h2 + p')?.innerText || null,
              video: i.querySelector('main > .flex-wrapper > div.flex-row > div > section.grid-section > figure iframe')?.src || null,
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

        const familySupport = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div.background-color-DFEAEB > section.content-section > h2'
          );
          if (content && content?.innerText === 'Family Support') {
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

        const memorialFund = await page.$eval('main > .grid-row', (i) => {
          let content = i.querySelector('.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2');
          if (content && content?.innerText === 'ProMedica Hospice Memorial Fund') {
            return (content = {
              content:
                i.querySelector('.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2 + p')?.innerText ||
                null,
              donate: i.querySelector('.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > a')?.href || null,
            });
          }
          return null;
        });

        const upcomingEvents = await page.$$eval('main > .events > div.span8 > section > ul.accordion-list > li', (item) => {
          return item.map(() => {
            let events = [];
            item.forEach((item) =>
              events.push({
                title: item.querySelector('div.toggle-title > h3')?.innerText || null,
                content: item.querySelector('div.toggle-inner')?.textContent || null,
              })
            );
            return events;
          });
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

        // External Videos
        externalVideos.push(
          await page.$eval('main', (i) => {
            const video = i.querySelector('iframe[src*="vidyard"]');
            if (video !== null) return video.src;
          })
        );

        // Images
        hospiceImages.push(
          await page.$eval('main', (i) => {
            const image = i.querySelector('img')?.src;
            if (image !== null) return image;
          })
        );

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=What Is Hospice"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let whatIs = [];
        if (subpageTitle.includes('What Is Hospice')) {
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
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          hospiceImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=Patient Services"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let services = [];
        if (subpageTitle.includes('Patient Services')) {
          const servicesDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          let differents = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > ul > li'
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

          differents = {
            title: differents.title,
            description: differents.description,
            image: differents.image,
            imageAlt: differents.imageAlt,
            list: differents.list.map((item) => {
              return {
                header: item.header,
                content: sanitize(item.content),
              };
            }),
          };

          const offered = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-1-Column > div.flex-row > div.full-width-Yes > section.grid-section > div.flex-row';

            let list = [];
            let li = i.querySelectorAll(`${root} section.grid-section > ul > li`);

            if (li.length <= 0)
              li = i.querySelectorAll(`${root} div.section-item-padding-large > section.grid-section ul.links-related > li`);

            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title: i.querySelector(`${root} section.grid-section > h2`)?.innerText || null,
              list,
              image: i.querySelector(`${root} section.grid-section > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} section.grid-section > figure > img`)?.alt || null,
            };
          });

          let team = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-row > div.configured-2-Column > div.flex-row > div:not(.background-color-F8F8F5) > section.grid-section > ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div:not(.background-color-F8F8F5) > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div:not(.background-color-F8F8F5) > section.grid-section > p'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                )?.alt || null,
              list,
            };
          });

          let bios = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-1-Column > div.flex-row > div.span12 > section.grid-section';

            let list = [];
            const li = i.querySelectorAll(`${root} > div.grid-row > div.background-color-0C466C section.content-section > ul > li`);

            li.forEach((item) => {
              let content = [];
              const inner = item.querySelectorAll('div.toggle-inner');
              inner.forEach((li) => content.push(li?.textContent || null));

              list.push({
                header: item.querySelector('div.toggle-title > h3')?.innerText || null,
                content,
              });
            });

            return {
              title:
                i.querySelector(`${root} > div.grid-row > div.background-color-0C466C section.content-section > h2`)?.innerText || null,
              list,
            };
          });

          bios = {
            title: bios.title,
            list: bios.list.map((item) => {
              return {
                header: item.header,
                content: item.content.map((item) => sanitize(item)),
              };
            }),
          };

          const veterans = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-1-Column > div.flex-row > div.span12 > section.grid-section';

            return {
              title:
                i.querySelector(`${root} > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2`)
                  ?.innerText || null,
              description:
                i.querySelector(`${root} > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > p`)
                  ?.innerText || null,
              anchor:
                i.querySelector(`${root} > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > a`)
                  ?.href || null,
              image:
                i.querySelector(
                  `${root} > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section > figure > img`
                )?.src || null,
              imageAlt:
                i.querySelector(
                  `${root} > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section > figure > img`
                )?.alt || null,
            };
          });

          const partners = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              `div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > ul > li`
            );

            li.forEach((item) => {
              let content = [];
              const inner = item.querySelectorAll('div.toggle-inner ul > li');
              inner.forEach((li) =>
                content.push({
                  anchor: li.querySelector('div.toggle-inner li a')?.innerText || null,
                  url: li.querySelector('div.toggle-inner li a')?.href || null,
                })
              );

              list.push({
                header: item.querySelector('div.toggle-title > h3')?.innerText || null,
                content,
              });
            });

            return {
              title:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > p'
                )?.innerText || null,
              image:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                )?.alt || null,
              list,
            };
          });

          const satisfaction = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.pattern-DFEAEB > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.pattern-DFEAEB > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2 + *'
                )?.innerHTML || null,
              quote:
                i.querySelector(
                  'div.pattern-DFEAEB > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section .bordered-content-inner blockquote'
                )?.innerText || null,
            };
          });

          services.push({
            servicesDescription: sanitize(servicesDescription),
            differents,
            offered,
            team,
            bios,
            veterans,
            partners,
            satisfaction,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          hospiceImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=Family Support"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let family = [];
        if (subpageTitle.includes('Family Support')) {
          const familyDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const bereavement = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-section > div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section div.bordered-content-inner ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title:
                i.querySelector(
                  'div.grid-section > div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-section > div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > p'
                )?.innerText || null,
              list,
            };
          });

          const donate = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > p'
                )?.innerText || null,
              anchor:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > a'
                )?.href || null,
              image:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          const planning = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section p'
                )?.innerText || null,
              anchor:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > a'
                )?.href || null,
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

          family.push({
            familyDescription: sanitize(familyDescription),
            bereavement,
            donate,
            planning,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          hospiceImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Stories"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let stories = [];
        if (subpageTitle.includes('Stories')) {
          const storiesDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const appreciation = await page.$eval('main > div.umb-grid', (i) => {
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
            };
          });

          await page.$$eval('.umb-grid section.grid-section div.featured-news-updates > article', (item) => {
            return item.map((q) => {
              const quoteContent = q.querySelector('div.featured-news-updates > article > a');
              if (quoteContent) quoteContent.click();
            });
          });

          let testimonials = await page.$$eval('.umb-grid section.grid-section div.featured-news-updates > article', (item) => {
            return item.map((q) => {
              let quote = q.querySelector('div.featured-news-updates > article > blockquote')?.innerText || null;
              let quoteContent = q.querySelector('div.featured-news-updates > article > a');

              if (quoteContent) {
                classname = quoteContent.classList.value;
                popup = classname.split('_open')[0];

                // Specific Error Scenarios
                if (popup !== 'popup_the"atea12' && popup !== 'popup_"madewit5' && popup !== 'popup_"heartac6')
                  quoteContent = document.querySelector(`#${popup}_wrapper > #${popup} > article`)?.innerHTML || null;
              }

              return {
                quote,
                quoteContent,
              };
            });
          });

          testimonials = testimonials.map((item) => {
            return {
              quote: item.quote,
              quoteContent: sanitize(item.quoteContent),
            };
          });

          const quote = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > p'
                )?.innerHTML || null,
              anchor:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > a'
                )?.href || null,
              quote:
                i.querySelector(
                  'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section .bordered-content-inner blockquote'
                )?.innerText || null,
            };
          });

          const moments = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section p'
                )?.innerText || null,
              anchor:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > a'
                )?.href || null,
              image:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row:not(:first-child) > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          stories.push({
            storiesDescription: sanitize(storiesDescription),
            appreciation,
            testimonials,
            quote,
            moments,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          hospiceImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Volunteering"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let volunteer = [];
        if (subpageTitle.includes('Volunteering')) {
          const volunteerDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const opportunities = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div.grid-row:first-child > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title:
                i.querySelector(
                  'div.grid-row:first-child > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.grid-row:first-child > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > p'
                )?.innerText || null,
              list,
              image:
                i.querySelector(
                  'div.grid-row:first-child > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div.grid-row:first-child > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          const becomeVolunteer = await page.$eval('main > div.umb-grid', (i) => {
            return {
              title:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section p'
                )?.innerText || null,
              englishForm:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section .bordered-content-inner a[href$=".pdf"]'
                )?.href || null,
              spanishForm:
                i.querySelector(
                  'div.pattern-0C466C > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section .bordered-content-inner a[href$="spanish.pdf"]'
                )?.href || null,
            };
          });

          const vetsToVets = await page.$eval('main > div.umb-grid', (i) => {
            let list = [];
            const li = i.querySelectorAll(
              'div:not(:first-child) > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > ul > li'
            );
            li.forEach((item) => list.push(item?.innerText || null));

            return {
              title:
                i.querySelector(
                  'div:not(:first-child) > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                )?.innerText || null,
              description:
                i.querySelector(
                  'div:not(:first-child) > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > p'
                )?.innerText || null,
              list,
              image:
                i.querySelector(
                  'div:not(:first-child) > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section > figure > img'
                )?.src || null,
              imageAlt:
                i.querySelector(
                  'div:not(:first-child) > div.configured-2-Column > div.flex-row > div:not(.content-section-Yes) > section.grid-section > figure > img'
                )?.alt || null,
            };
          });

          volunteer.push({
            volunteerDescription: sanitize(volunteerDescription),
            opportunities,
            becomeVolunteer,
            vetsToVets,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          hospiceImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
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
            upcomingEvents,
            testimonials,
            whatIs,
            services,
            family,
            stories,
            volunteer,
            moreInfo,
            contact,
            contactForm,
          },
        });

        console.log('Hospice', i + 1, 'Details Done');
      } catch (error) {
        await page.close();
        await browser.close();
        console.log({ error });
      }
    }
  }

  const jsonHospiceDetaills = JSON.stringify(hospiceDetaills, null, 2);
  fs.writeFile('./json/ProMedica/agency/hospice-details.json', jsonHospiceDetaills, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nHospice Details Imported!\n');
  });

  const jsonExternalVideos = JSON.stringify(
    externalVideos.filter((n) => n),
    null,
    2
  );
  fs.writeFile('./json/ProMedica/agency/Video/hospice-videos.json', jsonExternalVideos, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nExternal Videos Imported!\n');
  });

  const jsonExternalImages = JSON.stringify(hospiceImages, null, 2);
  fs.writeFile('./json/ProMedica/agency/Images/hospice-images.json', jsonExternalImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nImages Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
