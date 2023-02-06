import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function ALIL(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let ALILDetails = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();
        let subpageTitle;

        // THIS PAGE IT'S A REDDIRECT BUT IT DOES HAVE SUBPEAGES SO...
        let photoGallery = null;
        let virtualTour = null;
        let testimonialsVideo = null;
        let hospiceName = null;
        let address = null;
        let email = null;
        let phone = null;
        let fax = null;
        let title = null;
        let description = null;
        let rightTime = null;
        let featuresAmenities = null;
        let floorPlansVariety = null;
        if (links[i] !== 'http://www.villageatmanorcare.com/') {
          const banner = await page.locator('.hero-buttons-container > a[data-popup-ordinal="0"]').getByText('Photo Gallery').isVisible();

          let vTourButton = await page.locator('.hero-buttons-container > a[href*="http"]').getByText('Virtual Tour').first().isVisible();

          const testimonialsButton = await page
            .locator('.hero-buttons-container > a.testimonialVideoOverlay_open')
            .getByText('Testimonials')
            .first()
            .isVisible();

          if (banner) {
            await page.click('.hero-buttons-container > a.image-gallery');

            photoGallery = await page.$$eval(
              '#image-gallery section.image-gallery-container .slick-list .slick-track .slick-slide > img',
              (item) => {
                let images = [];
                item.forEach((item) => images.push({ imgSrc: item?.src || null, imgAlt: item?.alt || null }));
                return images;
              }
            );

            await page.keyboard.press('Escape');
          }

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

          if (testimonialsButton) {
            await page.click('.hero-buttons-container > a.testimonialVideoOverlay_open');

            testimonialsVideo = await page.$eval(
              '#testimonialVideoOverlay',
              (i) => i.querySelector('#testimonialVideoOverlay iframe')?.src || null
            );

            await page.keyboard.press('Escape');
          }

          hospiceName = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > h2')?.innerText || null);

          address = await page.$eval('.hero-section', (item) => {
            return {
              address1: item.querySelector('.hero-overlay p:not(.hero-map-link)')?.innerText || null,
              address2: item.querySelector('.hero-overlay p.hero-map-link')?.innerText || null,
              directions: item.querySelector('.hero-overlay p.directions > a[href*="http"]')?.href || null,
            };
          });

          email = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#email-link')?.innerText || null);

          phone = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#phone-link')?.innerText || null);

          fax =
            (await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > p:not(.no-margin) > a[href*="tel:"]')?.innerText)) ||
            null;

          title = (await page.$eval('.hero-section', (i) => i.querySelector('.hero-copy > h1')?.innerText)) || null;

          description = await page.$eval(
            '.hero-section',
            (i) => i.querySelector('.hero-copy > p > span') || i.querySelector('.hero-copy > p')?.innerText || null
          );

          rightTime = await page.$eval('main > .umb-grid', (i) => {
            let content = i.querySelector(
              'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2'
            );

            if (content && content?.innerText === 'The Right Time') {
              return (content = {
                content:
                  i.querySelector(
                    'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2 + * + *'
                  )?.innerText || null,
                learnMore:
                  i.querySelector(
                    'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > a'
                  )?.href || null,
              });
            }

            return null;
          });

          featuresAmenities = await page.$eval('main > .umb-grid', (i) => {
            let content = i.querySelector(
              'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2'
            );

            if (content && content?.innerText === 'Features') {
              return (content = {
                content:
                  i.querySelector(
                    'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2 + *'
                  )?.innerText || null,
                learnMore:
                  i.querySelector(
                    'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > a'
                  )?.href || null,
              });
            }

            return null;
          });

          floorPlansVariety = await page.$eval('main > .umb-grid', (i) => {
            let content = i.querySelector(
              'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > h2'
            );

            if (content && content?.innerText === 'Variety of Floor Plans') {
              return (content = {
                content:
                  i.querySelector(
                    'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > h2 + *'
                  )?.innerText || null,
                learnMore:
                  i.querySelector(
                    'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > a'
                  )?.href || null,
              });
            }

            return null;
          });
        }

        await page.goto(`${links[i]}/floor-plans`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let floorPlansDescription = null;
        let floorPlansDetails = null;
        if (subpageTitle.includes('Floor Plans')) {
          floorPlansDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          floorPlansDetails = await page.$$eval(
            'div.configured-Full-Width section.grid-section div.layout-slider > div > div.full-width > .slick-list > .slick-track > section.slick-slide',
            (item) => {
              let images = [];
              item.forEach((item) => {
                images.push({
                  floorPlanSrc: item.querySelector('section.content-section > img')?.src || null,
                  floorPlanName: item.querySelector('section.content-section > h2')?.innerText || null,
                  floorPlanDetail: item.querySelector('section.content-section > p')?.innerHTML || null,
                });
              });
              return images;
            }
          );
        }

        await page.goto(`${links[i]}/design-and-layout`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let designLayout = [];
        if (subpageTitle.includes('Design and Layout')) {
          const designLayoutDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const communityLayout = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row:first-child > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          const residentialAcommodations = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row.pattern-F8F8F5 > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          const memoryCareServices = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes.background-color-0C466C > section.grid-section'
              )?.innerHTML || null
          );

          const safety = await page.$eval(
            'main > div.umb-grid',
            (i) =>
              i.querySelector(
                'div.grid-row:last-child > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
              )?.innerHTML || null
          );

          designLayout.push({
            designLayoutDescription: sanitize(designLayoutDescription),
            communityLayout: sanitize(communityLayout),
            residentialAcommodations: sanitize(residentialAcommodations),
            memoryCareServices: sanitize(memoryCareServices),
            safety: sanitize(safety),
          });
        }

        await page.goto(`${links[i]}/services`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let generalServices = null;
        let expandedServices = null;
        let otherServices = null;
        if (subpageTitle.includes('Services')) {
          generalServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(1) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText || null));
              return services;
            }
          );

          expandedServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText || null));
              return services;
            }
          );

          otherServices = await page.$$eval('main > div.umb-grid section.grid-section > div.row', (item) => {
            let services = [];

            item.forEach((item) => {
              const child = item.querySelectorAll('div.span6');

              let children = [];
              child.forEach((item) => {
                const key = item.querySelector('div.span6 > section > h2')?.innerText;
                if (!key) return null;

                let value = [];
                const list = item.querySelectorAll('div.span6 > section > ul > li');
                list.forEach((li) => value.push(li?.innerText || null));

                children.push({ [key]: value });
              });

              return services.push(children);
            });

            return services.flat();
          });
        }

        await page.goto(`${links[i]}/features`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let features = [];
        if (subpageTitle.includes('Features')) {
          const generalFeatures = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(1) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let features = [];
              item.forEach((item) => features.push(item?.innerText || null));
              return features;
            }
          );

          const suiteFeatures = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let features = [];
              item.forEach((item) => features.push(item?.innerText || null));
              return features;
            }
          );

          features.push({
            generalFeatures,
            suiteFeatures,
          });
        }

        await page.goto(`${links[i]}/features-amenities`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        if (!subpageTitle.includes('Amenities')) {
          await page.goto(`${links[i]}/amenities`, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let amenities = [];
        if (subpageTitle.includes('Amenities')) {
          const generalAmenities = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(1) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return services;
            }
          );

          const expandedAmenities = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return services;
            }
          );

          const roomAmenities = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(3) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return services;
            }
          );

          const lifeEnrichment = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(1) > div:nth-child(1) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return services;
            }
          );

          const hospitality = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(1) > div:nth-child(2) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return services;
            }
          );

          const culinary = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(2) > div:nth-child(1) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return services;
            }
          );

          const transportation = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(2) > div:nth-child(2) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return services;
            }
          );

          amenities.push({
            generalAmenities,
            expandedAmenities,
            roomAmenities,
            lifeEnrichment,
            hospitality,
            culinary,
            transportation,
          });
        }

        await page.goto(`${links[i]}/payment`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        if (!subpageTitle.includes('Payment')) {
          await page.goto(`${links[i]}/services-and-fees`, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let payment = [];
        if (subpageTitle.includes('Payment') || subpageTitle.includes('Services and Fees')) {
          const paymentInfo = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const servicesFees = await page.$eval(
            'main > div.umb-grid ',
            (i) => i.querySelector('div.content-section-Yes > section.grid-section > h2 + *')?.innerHTML || null
          );

          const paymentLink = await page.$eval(
            'main > div.umb-grid section.grid-section',
            (i) => i.querySelector('a.paymentLink')?.href || null
          );

          payment.push({
            paymentInfo: sanitize(paymentInfo),
            servicesFees: sanitize(servicesFees),
            paymentLink,
          });
        }

        await page.goto(`${links[i]}/payment/veteran-benefits`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let veterans = [];
        if (subpageTitle.includes('Veteran')) {
          const veteranBenefits = await page.$eval(
            'main > div.umb-grid section.grid-section',
            (i) => i.querySelector('main > div.umb-grid section.grid-section > p')?.innerText || null
          );

          const processingApproval = await page.$eval(
            'main > div.umb-grid',
            (i) => i.querySelector('div.background-color-DFEAEB > section.grid-section')?.innerHTML || null
          );

          const benefitLevels = await page.$$eval(
            'main > div.umb-grid div.grid-row > div.configured-4-Column > div > div.span3',
            (item) => {
              let benefits = [];
              item.forEach((item) => {
                const key = item.querySelector('h3')?.innerText;
                if (!key) return null;

                return benefits.push({
                  [key]: item.querySelector('h4')?.innerText || null,
                });
              });
              return benefits;
            }
          );

          const requirements = await page.$$eval(
            'main > div.umb-grid div.grid-row div.content-section-Yes > section.grid-section > ul > li',
            (item) => {
              let requirements = [];
              item.forEach((item) => requirements.push(item?.innerText || null));
              return requirements;
            }
          );

          veterans.push({
            veteranBenefits,
            processingApproval: sanitize(processingApproval),
            benefitLevels,
            requirements,
          });
        }

        await page.goto(`${links[i]}/contact-us`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

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

        await page.goto(`${links[i]}/special-needs-communications`, {
          waitUntil: 'domcontentloaded',
        });
        subpageTitle = await page.title();

        let specialNeeds = null;
        if (subpageTitle.includes('Special Needs')) {
          specialNeeds = await page.$eval(
            'main > div.umb-grid div.configured-2-Column',
            (i) => i.querySelector('div.content-section-Yes > section.grid-section')?.innerHTML || null
          );
        }

        await page.goto(`${links[i]}/notice-of-information-practices`, {
          waitUntil: 'domcontentloaded',
        });
        subpageTitle = await page.title();

        let englisPDF = null;
        let spanishPDF = null;
        if (subpageTitle.includes('Notice of Information')) {
          englisPDF = await page.$eval('section.grid-section', (i) => i.querySelector('a[data-id="12218"]')?.href || null);
          spanishPDF = await page.$eval('section.grid-section', (i) => i.querySelector('a[data-id="12342"]')?.href || null);
        }

        const moreInfo = await page.$eval(
          'main',
          (i) => i.querySelector('main > div:last-of-type > div > div:nth-child(1) > section > a')?.href || null
        );

        const contact = await page.$eval(
          'main',
          (i) => i.querySelector('main > div:last-of-type > div > div:nth-child(2) > section > a')?.href || null
        );

        ALILDetails.push({
          id: i + 1,
          title: articlesTitle,
          url: links[i],
          content: {
            photoGallery,
            virtualTour,
            testimonialsVideo,
            hospiceName,
            address,
            email,
            phone,
            fax,
            title,
            description,
            rightTime,
            featuresAmenities,
            floorPlansVariety,
            floorPlansDescription: sanitize(floorPlansDescription),
            floorPlansDetails,
            designLayout,
            generalServices,
            expandedServices,
            otherServices,
            features,
            amenities,
            payment,
            veterans,
            specialNeeds: sanitize(specialNeeds),
            moreInfo,
            englisPDF,
            spanishPDF,
            contact,
            contactForm,
          },
        });

        console.log('ALIL', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonALILDetaills = JSON.stringify(ALILDetails, null, 2);
  fs.writeFile('./json/ProMedica/agency/ALIL.json', jsonALILDetaills, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nALIL Details Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
