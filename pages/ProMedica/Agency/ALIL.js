import fs from 'fs';
import { chromium } from 'playwright';

export default async function ALIL(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let ALILDetails = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();

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

        const features = await page.$eval('main > .umb-grid', (i) => {
          let content = i.querySelector(
            'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2'
          );
          if (content && content.innerText === 'Features') {
            return (content = {
              content:
                i.querySelector(
                  'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2 + p'
                ).innerText || null,
              learnMore:
                i.querySelector(
                  'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > a'
                ).href || null,
            });
          }
          return null;
        });

        const floorPlansVariety = await page.$eval('main > .umb-grid', (i) => {
          let content = i.querySelector(
            'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > h2'
          );
          if (content && content.innerText === 'Variety of Floor Plans') {
            return (content = {
              content:
                i.querySelector(
                  'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > h2 + p'
                ).innerText || null,
              learnMore:
                i.querySelector(
                  'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > a'
                ).href || null,
            });
          }
          return null;
        });

        let floorPlansDescription = null;
        let floorPlansDetails = null;
        if (articlesTitle.includes('Floor Plans')) {
          floorPlansDescription = await page.$eval('.hero-section', (i) => {
            let content = i.querySelector('.hero-overlay');
            if (content) content = content.innerHTML;
            return content;
          });

          floorPlansDetails = await page.$$eval(
            'div.configured-Full-Width section.grid-section div.layout-slider > div > div.full-width > .slick-list > .slick-track > section.slick-slide',
            (item) => {
              let images = [];
              item.forEach((item) =>
                images.push({
                  floorPlanSrc: item.querySelector('section.content-section > img').src,
                  floorPlanName: item.querySelector('section.content-section > h2').innerText,
                  floorPlanDetail: item.querySelector('section.content-section > p').innerHTML,
                })
              );
              return images;
            }
          );
        }

        let generalServices = null;
        let expandedServices = null;
        if (articlesTitle.includes('Services')) {
          generalServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(1) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          expandedServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );
        }

        let generalAmenities = null;
        let expandedAmenities = null;
        if (articlesTitle.includes('Amenities')) {
          generalAmenities = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(1) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          expandedAmenities = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );
        }

        let paymentInfo = null;
        let paymentLink = null;
        if (articlesTitle.includes('Payment')) {
          paymentInfo = await page.$eval('.hero-section', (i) => {
            let content = i.querySelector('.hero-overlay');
            if (content) content = content.innerHTML;
            return content;
          });

          paymentLink = await page.$eval('main > div.umb-grid section.grid-section', (i) => {
            let content = i.querySelector('a.paymentLink');
            if (content) content = content.href;
            return content;
          });
        }

        let veteranBenefits = null;
        let processingApproval = null;
        let benefitLevels = null;
        let requirements = null;
        if (articlesTitle.includes('Veteran')) {
          veteranBenefits = await page.$eval('main > div.umb-grid section.grid-section', (i) => {
            let content = i.querySelector('main > div.umb-grid section.grid-section > p');
            if (content) content = content.innerText;
            return content;
          });

          processingApproval = await page.$eval('main > div.umb-grid section.grid-section', (i) => {
            let content = i.querySelector(
              'main > div.umb-grid div.background-color-DFEAEB > section.grid-section'
            );
            if (content) content = content.innerHTML;
            return content;
          });

          benefitLevels = await page.$$eval(
            'main > div.umb-grid div.grid-row > div.configured-4-Column > div > div.span3',
            (item) => {
              let benefits = [];
              item.forEach((item) => {
                const key = item.querySelector('h3').innerText;
                return benefits.push({
                  [key]: item.querySelector('h4').innerText,
                });
              });
              return benefits;
            }
          );

          requirements = await page.$$eval(
            'main > div.umb-grid div.grid-row div.content-section-Yes > section.grid-section > ul > li',
            (item) => {
              let requirements = [];
              item.forEach((item) => requirements.push(item.innerText));
              return requirements;
            }
          );
        }

        let contactForm = null;
        if (articlesTitle.includes('Contact')) {
          contactForm = await page.$eval('section.grid-section', (i) => {
            let content = document.evaluate(
              '//div[starts-with(@id,"umbraco_form")]',
              document.body,
              null,
              XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
              null
            );

            if (content) content = content.snapshotItem(0).innerHTML;
            return content;
          });
        }

        let specialNeeds = null;
        if (articlesTitle.includes('Special Needs')) {
          specialNeeds = await page.$eval('main > div.umb-grid div.configured-2-Column', (i) => {
            let content = i.querySelector('section.grid-section');
            if (content) content = content.innerHTML;
            return content;
          });
        }

        const englisPDF = await page.$eval('section.grid-section', (i) => {
          let content = i.querySelector('a[data-id="12218"]');
          if (content) content = content.href;
          return content;
        });

        const spanishPDF = await page.$eval('section.grid-section', (i) => {
          let content = i.querySelector('a[data-id="12342"]');
          if (content) content = content.href;
          return content;
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
            features,
            floorPlansVariety,
            floorPlansDescription,
            floorPlansDetails,
            generalServices,
            expandedServices,
            generalAmenities,
            expandedAmenities,
            paymentInfo,
            paymentLink,
            veteranBenefits,
            processingApproval,
            benefitLevels,
            requirements,
            specialNeeds,
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
