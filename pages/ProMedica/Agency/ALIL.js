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
        let subpageTitle;

        const banner = await page
          .locator('.hero-buttons-container > a[data-popup-ordinal="0"]')
          .getByText('Photo Gallery')
          .isVisible();

        let vTourButton = await page
          .locator('.hero-buttons-container > a[href*="http"]')
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

            virtualTour = await page.$eval('#vt_overlay', (i) => {
              let video = i.querySelector('#vt_overlay iframe');
              if (video) video = video.src;
              return video;
            });

            await page.keyboard.press('Escape');
          }
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
          let content = i.querySelector('.hero-overlay > p:not(.no-margin) > a[href*="tel:"]');
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

        const featuresAmenities = await page.$eval('main > .umb-grid', (i) => {
          let content = i.querySelector(
            'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2'
          );
          if (content && content.innerText === 'Features') {
            return (content = {
              content: i.querySelector(
                'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > h2 + *'
              )?.innerText,
              learnMore: i.querySelector(
                'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes > section.grid-section > a'
              )?.href,
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
              content: i.querySelector(
                'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > h2 + *'
              )?.innerText,
              learnMore: i.querySelector(
                'main > .umb-grid > .grid-section > .grid-row > div > div.flex-row > .content-section-Yes.background-color-DFEAEB > section.grid-section > a'
              )?.href,
            });
          }
          return null;
        });

        await page.goto(`${links[i]}/floor-plans`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let floorPlansDescription = null;
        let floorPlansDetails = null;
        if (subpageTitle.includes('Floor Plans')) {
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
                  floorPlanSrc: item.querySelector('section.content-section > img')?.src,
                  floorPlanName: item.querySelector('section.content-section > h2')?.innerText,
                  floorPlanDetail: item.querySelector('section.content-section > p')?.innerHTML,
                })
              );
              return images;
            }
          );
        }

        await page.goto(`${links[i]}/design-and-layout`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let designLayout = [];
        if (subpageTitle.includes('Design and Layout')) {
          const designLayoutDescription = await page.$eval('.hero-section', (i) => {
            let content = i.querySelector('.hero-overlay');
            if (content) content = content.innerHTML;
            return content;
          });

          const communityLayout = await page.$eval('main > div.umb-grid', (i) => {
            let content = i.querySelector(
              'div.grid-row:first-child > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
            );
            if (content) content = content.innerHTML;
            return content;
          });

          const residentialAcommodations = await page.$eval('main > div.umb-grid', (i) => {
            let content = i.querySelector(
              'div.grid-row.pattern-F8F8F5 > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
            );
            if (content) content = content.innerHTML;
            return content;
          });

          const memoryCareServices = await page.$eval('main > div.umb-grid', (i) => {
            let content = i.querySelector(
              'div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes.background-color-0C466C > section.grid-section'
            );
            if (content) content = content.innerHTML;
            return content;
          });

          const safety = await page.$eval('main > div.umb-grid', (i) => {
            let content = i.querySelector(
              'div.grid-row:last-child > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section'
            );
            if (content) content = content.innerHTML;
            return content;
          });

          designLayout.push({
            designLayoutDescription,
            communityLayout,
            residentialAcommodations,
            memoryCareServices,
            safety,
          });
        }

        await page.goto(`${links[i]}/services`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let services = [];
        if (subpageTitle.includes('Services')) {
          const generalServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(1) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const expandedServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const healthServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(1) > div:nth-child(1) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const socialServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(1) > div:nth-child(2) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const personalServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(2) > div:nth-child(1) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const foodServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(2) > div:nth-child(2) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const additionalServices = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(3) > div:nth-child(1) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          services.push({
            generalServices,
            expandedServices,
            healthServices,
            socialServices,
            personalServices,
            foodServices,
            additionalServices,
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
              item.forEach((item) => features.push(item.innerText));
              return features;
            }
          );

          const suiteFeatures = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let features = [];
              item.forEach((item) => features.push(item.innerText));
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
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const expandedAmenities = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(2) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const roomAmenities = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.even-height > div:nth-child(3) > div.bordered-content > div.bordered-content-inner > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const lifeEnrichment = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(1) > div:nth-child(1) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const hospitality = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(1) > div:nth-child(2) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const culinary = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(2) > div:nth-child(1) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
              return services;
            }
          );

          const transportation = await page.$$eval(
            'main > div.umb-grid section.grid-section > div.inset-grid-lines > div.row:nth-child(2) > div:nth-child(2) > section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item.innerText));
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

        let payment = [];
        if (subpageTitle.includes('Payment')) {
          const paymentInfo = await page.$eval('.hero-section', (i) => {
            let content = i.querySelector('.hero-overlay');
            if (content) content = content.innerHTML;
            return content;
          });

          const paymentLink = await page.$eval('main > div.umb-grid section.grid-section', (i) => {
            let content = i.querySelector('a.paymentLink');
            if (content) content = content.href;
            return content;
          });

          payment.push({
            paymentInfo,
            paymentLink,
          });
        }

        await page.goto(`${links[i]}/payment/veteran-benefits`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let veterans = [];
        if (subpageTitle.includes('Veteran')) {
          const veteranBenefits = await page.$eval(
            'main > div.umb-grid section.grid-section',
            (i) => {
              let content = i.querySelector('main > div.umb-grid section.grid-section > p');
              if (content) content = content.innerText;
              return content;
            }
          );

          const processingApproval = await page.$eval('main > div.umb-grid', (i) => {
            let content = i.querySelector('div.background-color-DFEAEB > section.grid-section');
            if (content) content = content.innerHTML;
            return content;
          });

          const benefitLevels = await page.$$eval(
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

          const requirements = await page.$$eval(
            'main > div.umb-grid div.grid-row div.content-section-Yes > section.grid-section > ul > li',
            (item) => {
              let requirements = [];
              item.forEach((item) => requirements.push(item.innerText));
              return requirements;
            }
          );

          veterans.push({
            veteranBenefits,
            processingApproval,
            benefitLevels,
            requirements,
          });
        }

        await page.goto(`${links[i]}/contact-us`, { waitUntil: 'domcontentloaded' });
        subpageTitle = await page.title();

        let contactForm = null;
        if (subpageTitle.includes('Contact')) {
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

        await page.goto(`${links[i]}/special-needs-communications`, {
          waitUntil: 'domcontentloaded',
        });
        subpageTitle = await page.title();

        let specialNeeds = [];
        if (subpageTitle.includes('Special Needs')) {
          specialNeeds = await page.$eval('main > div.umb-grid div.configured-2-Column', (i) => {
            let content = i.querySelector('div.content-section-Yes > section.grid-section');
            if (content) content = content.innerHTML;
            return content;
          });
        }

        await page.goto(`${links[i]}/notice-of-information-practices`, {
          waitUntil: 'domcontentloaded',
        });
        subpageTitle = await page.title();

        let englisPDF = null;
        let spanishPDF = null;
        if (subpageTitle.includes('Notice of Information')) {
          englisPDF = await page.$eval('section.grid-section', (i) => {
            let content = i.querySelector('a[data-id="12218"]');
            if (content) content = content.href;
            return content;
          });

          spanishPDF = await page.$eval('section.grid-section', (i) => {
            let content = i.querySelector('a[data-id="12342"]');
            if (content) content = content.href;
            return content;
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
            featuresAmenities,
            floorPlansVariety,
            floorPlansDescription,
            floorPlansDetails,
            designLayout,
            services,
            features,
            amenities,
            payment,
            veterans,
            specialNeeds,
            moreInfo,
            englisPDF,
            spanishPDF,
            contact,
            // contactForm,
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
