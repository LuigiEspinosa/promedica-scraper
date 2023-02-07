import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function MemoryCare(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let memoryCareDetails = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();
        let subpageTitle, menuLink;

        await page.waitForSelector('.hero-section');

        const banner = await page.locator('.hero-buttons-container > a[data-popup-ordinal="0"]').getByText('Photo Gallery').isVisible();

        let vTourButton = await page.locator('.hero-buttons-container > a[href*="http"]').getByText('Virtual Tour').first().isVisible();

        const testimonialsButton = await page
          .locator('.hero-buttons-container > a.testimonialVideoOverlay_open')
          .getByText('Testimonials')
          .first()
          .isVisible();

        const vEventsButton = await page.locator('.hero-buttons-container > a.button').getByText('Virtual Events').first().isVisible();

        let photoGallery;
        if (banner) {
          await page.click('.hero-buttons-container > a.image-gallery');

          photoGallery = await page.$$eval(
            '#image-gallery section.image-gallery-container .slick-list .slick-track .slick-slide > img',
            (item) => {
              let images = [];
              item.forEach((item) =>
                images.push({
                  imgSrc: item?.src || null,
                  imgAlt: item?.alt || null,
                })
              );
              return images;
            }
          );

          await page.keyboard.press('Escape');
        }

        let virtualTour;
        if (vTourButton) {
          virtualTour = await page
            .locator('.hero-buttons-container > a[href*="http"]')
            .getByText('Virtual Tour')
            .first()
            .getAttribute('href');
        } else {
          vTourButton = await page
            .locator('.hero-buttons-container > a.vt_overlay_open[data-popup-ordinal="0"]')
            .getByText('Virtual Tour')
            .isVisible();

          if (vTourButton) {
            await page.click('.hero-buttons-container > a.vt_overlay_open');

            virtualTour = await page.$eval('#vt_overlay', (i) => i.querySelector('#vt_overlay iframe')?.src || null);

            await page.keyboard.press('Escape');
          }
        }

        let testimonialsVideo;
        if (testimonialsButton) {
          await page.click('.hero-buttons-container > a.testimonialVideoOverlay_open');

          testimonialsVideo = await page.$eval(
            '#testimonialVideoOverlay',
            (i) => i.querySelector('#testimonialVideoOverlay iframe')?.src || null
          );

          await page.keyboard.press('Escape');
        }

        let virtualEvents;
        if (vEventsButton) {
          virtualEvents = await page.locator('.hero-buttons-container > a.button').getByText('Virtual Events').first().getAttribute('href');
        }

        const hospiceName = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > h2')?.innerText || null);

        const address = await page.$eval('.hero-section', (item) => {
          let address1 = item.querySelector('.hero-overlay p:not(.hero-map-link)')?.innerText || null;
          let address2 = item.querySelector('.hero-overlay p.hero-map-link')?.innerText || null;
          let directions = item.querySelector('.hero-overlay p.directions > a[href*="http"]')?.href || null;

          return {
            address1,
            address2,
            directions,
          };
        });

        const email = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#email-link')?.innerText || null);

        const phone = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#phone-link')?.innerText || null);

        const fax =
          (await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > p:not(.no-margin) > a[href*="tel:"]')?.innerText)) ||
          null;

        const title = await page.$eval('.hero-section', (i) => i.querySelector('.hero-copy > h1')?.innerText || null);

        const description = await page.$eval(
          '.hero-section',
          (i) => i.querySelector('.hero-copy > h1 + *')?.innerHTML || i.querySelector('.hero-copy > h1 + *')?.innerHTML || null
        );

        const customizedCare = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2');
          if (content && content?.innerText === 'Customized Care & Services') {
            return (content = {
              content:
                i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > h2 + p')?.innerText || null,
              learnMore: i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div > section.content-section > a')?.href || null,
            });
          }
          return null;
        });

        const designLayout = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > .flex-wrapper > div:not(.flex-row) > div.background-color-white > section.content-section > h2'
          );
          if (content && content?.innerText === 'Design & Layout') {
            return (content = {
              content:
                i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div.background-color-white > section.content-section > h2 + p')
                  ?.innerText || null,
              learnMore:
                i.querySelector('main > .flex-wrapper > div:not(.flex-row) > div.background-color-white > section.content-section > a')
                  ?.href || null,
            });
          }
          return null;
        });

        const upcomingEvents = await page.$$eval('main > .events > div.span8 > section > ul.accordion-list > li', (item) => {
          return item.map((q) => {
            let events = [];
            item.forEach((item) =>
              events.push({
                title: item.querySelector('div.toggle-title > h3')?.innerText || null,
                content: item.querySelector('div.toggle-inner')?.innerHTML || null,
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

        for (let i = 0; i < testimonials?.length; i++) {
          await page.keyboard.press('Escape');
        }

        const memorialFund = await page.$eval('main > .grid-row', (i) => {
          let content = i.querySelector('.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2');
          if (content && content?.innerText === 'ProMedica Memory Care Fund') {
            return (content = {
              content:
                i.querySelector('.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > h2 + p')?.innerText ||
                null,
              donate: i.querySelector('.flex-wrapper.configured-2-Column > div.flex-row > div > section.grid-section > a')?.href || null,
            });
          }
          return null;
        });

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Services"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let services = null;
        if (subpageTitle.includes('Services')) {
          services = await page.$$eval('main > div.umb-grid section.grid-section > div.row', (item) => {
            let services = [];

            item.forEach((item) => {
              const child = item.querySelectorAll('div.span6');

              let children = [];
              child.forEach((item) => {
                const key = item.querySelector('div.span6 > section > h2')?.innerText;
                if (!key) return null;

                let list = [];
                const value = item.querySelectorAll('div.span6 > section > ul > li');
                value.forEach((li) => list.push(li?.innerText || null));

                const description = item.querySelector('div.span6 > section > p')?.innerText || null;

                children.push({ [key]: { description, list } });
              });

              return services.push(children);
            });

            return services.flat();
          });
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Design"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let design = [];
        if (subpageTitle.includes('Design')) {
          const designDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const communityLayout = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.pattern-DFEAEB > div.configured-Centered > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML ||
              i.querySelector('div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section')
                ?.innerHTML ||
              null
          );

          const floorPlansImage = await page.$eval(
            'main > div.umb-grid',
            (i) => i.querySelector('div.mobile-full-width-Yes section.grid-section img')?.src || null
          );

          const floorPlansAlt = await page.$eval(
            'main > div.umb-grid',
            (i) => i.querySelector('div.mobile-full-width-Yes section.grid-section img')?.alt || null
          );

          const residentialAcommodations = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.pattern-F8F8F5 > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML ||
              i.querySelector('div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-0C466C > section.grid-section')
                ?.innerHTML ||
              null
          );

          const visualCues = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.pattern-F8F8F5 + div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-0C466C > section.grid-section'
              )?.innerHTML ||
              i.querySelector(
                'div.grid-row > div.configured-2-Column > div.flex-row > div:not(.background-color-0C466C) > section.grid-section'
              )?.innerHTML ||
              null
          );

          const safety = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-E8F0F1 > section.grid-section')
                ?.innerHTML ||
              i.querySelector(
                'div.reverse-stack-Yes + div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML ||
              null
          );

          const roomOptionsDescription = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row > div.configured-2-Column > div.flex-row > div.full-width-Yes + div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          const roomOptionsImage = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-2-Column > div.flex-row > div.full-width-Yes > section.grid-section img')
                ?.src || null
          );

          const roomOptionsAlt = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-2-Column > div.flex-row > div.full-width-Yes > section.grid-section img')
                ?.alt || null
          );

          design.push({
            designDescription: sanitize(designDescription),
            communityLayout: sanitize(communityLayout),
            floorPlans: {
              img: floorPlansImage,
              alt: floorPlansAlt,
            },
            residentialAcommodations: sanitize(residentialAcommodations),
            visualCues: sanitize(visualCues),
            safety: sanitize(safety),
            roomOptions: {
              description: sanitize(roomOptionsDescription),
              img: roomOptionsImage,
              alt: roomOptionsAlt,
            },
          });
        }

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=Arden Courts Living"]')?.href || null
        );
        if (menuLink) await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let living = [];
        if (subpageTitle.includes('Living')) {
          const livingDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const ourStaff = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section')
                ?.innerHTML || null
          );

          const familySupport = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.pattern-F8F8F5 > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          const likeHome = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.mobile-full-width-Yes > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          const hours = await page.$$eval(
            'main > div.umb-grid div.reverse-stack-Yes > div.configured-2-Column > div.flex-row > div > section.grid-section div.bordered-content-inner > div > p',
            (item) => {
              let hours = [];
              item.forEach((item) => hours.push(item?.innerText));
              return hours;
            }
          );

          living.push({
            livingDescription: sanitize(livingDescription),
            ourStaff: sanitize(ourStaff),
            familySupport: sanitize(familySupport),
            likeHome: sanitize(likeHome),
            hours,
          });
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Programming"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let programming = [];
        if (subpageTitle.includes('Programming')) {
          const programmingDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const individualPursuits = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section')
                ?.innerHTML || null
          );

          const ETT = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row:nth-child(2) > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          const lifestyle = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row:nth-child(3) > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          const namaste = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row:nth-child(4) > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          programming.push({
            programmingDescription: sanitize(programmingDescription),
            individualPursuits: sanitize(individualPursuits),
            ETT: sanitize(ETT),
            lifestyle: sanitize(lifestyle),
            namaste: sanitize(namaste),
          });
        }

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=Dementia Types"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let dementia = [];
        if (subpageTitle.includes('Dementia')) {
          const dementiaDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const whatIs = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2 + *'
              )?.innerHTML || null
          );

          const types = await page.$$eval('div.grid-row:nth-child(2) > div.configured-2-Column > div.flex-row', (item) => {
            let types = [];
            item.forEach((item) => {
              const description =
                item.querySelector('div.span6.background-color-F8F8F5 > section.grid-section > h2 + *')?.innerText || null;
              const list = item.querySelectorAll(
                'div.span6.content-section-No > section.grid-section > div.button-stack > div.row > div.col > a.button'
              );

              let buttons = [];
              list.forEach((item) =>
                buttons.push({
                  name: item?.innerText || null,
                  url: item?.href || null,
                })
              );

              types.push({
                description,
                list: buttons,
              });
            });
            return types;
          });

          const planning = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-No + div.content-section-Yes > section.grid-section > h2 + *'
              )?.innerHTML || null
          );

          dementia.push({
            dementiaDescription: sanitize(dementiaDescription),
            whatIs: sanitize(whatIs),
            types,
            planning: sanitize(planning),
          });
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Payment"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let payment = [];
        if (subpageTitle.includes('Payment')) {
          const paymentDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const privatePayment = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-3-Column > div.flex-row > div:nth-child(1) > section.grid-section > p')
                ?.innerText || null
          );

          const medicare = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-3-Column > div.flex-row > div:nth-child(2) > section.grid-section > p')
                ?.innerText || null
          );

          const insurance = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector('div.grid-row > div.configured-3-Column > div.flex-row > div:nth-child(3) > section.grid-section > p')
                ?.innerText || null
          );

          payment.push({
            paymentDescription: sanitize(paymentDescription),
            privatePayment,
            medicare,
            insurance,
          });
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
            description: sanitize(description),
            customizedCare,
            designLayout,
            upcomingEvents,
            testimonials,
            memorialFund,
            services,
            design,
            living,
            programming,
            dementia,
            payment,
            moreInfo,
            contact,
            contactForm,
          },
        });

        console.log('Memory Care', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonMemoryCareDetaills = JSON.stringify(memoryCareDetails, null, 2);
  fs.writeFile('./json/ProMedica/agency/memory-care-details.json', jsonMemoryCareDetaills, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nMemory Care Details Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
