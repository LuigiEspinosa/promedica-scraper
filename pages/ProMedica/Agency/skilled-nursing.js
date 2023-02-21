import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function SkilledNursing(links) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let skilledNursingDetails = [];
  let externalVideos = [];
  let nursingImages = [];
  for (let i = 0; i <= links.length; i++) {
    if (links[i] !== undefined) {
      await page.goto(links[i], { waitUntil: 'domcontentloaded' });

      try {
        let subpageTitle, menuLink;
        const articlesTitle = await page.title();
        const metaTags = await page.$$eval('meta', (meta) => meta.map((i) => i.outerHTML));

        await page.waitForSelector('.hero-section');

        const banner = await page.locator('.hero-buttons-container > a[data-popup-ordinal="0"]').getByText('Photo Gallery').isVisible();

        let vTourButton = await page.locator('.hero-buttons-container > a[href*="http"]').getByText('Virtual Tour').first().isVisible();

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

        let virtualTour = null;
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

        let testimonialsVideo = null;
        if (testimonialsButton) {
          await page.click('.hero-buttons-container > a.testimonialVideoOverlay_open');

          testimonialsVideo = await page.$eval(
            '#testimonialVideoOverlay',
            (i) => i.querySelector('#testimonialVideoOverlay iframe')?.src || null
          );

          await page.keyboard.press('Escape');
        }

        const hospiceName = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay > h2')?.innerText || null);

        const address = await page.$eval('.hero-section', (item) => {
          return {
            address1: item.querySelector('.hero-overlay p:not(.hero-map-link)')?.innerText || null,
            address2: item.querySelector('.hero-overlay p.hero-map-link')?.innerText || null,
            directions: item.querySelector('.hero-overlay p.directions > a[href*="http"]')?.href || null,
          };
        });

        const email = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#email-link')?.innerText || null);

        const phone = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay a#phone-link')?.innerText || null);

        const fax = await page.$eval(
          '.hero-section',
          (i) => i.querySelector('.hero-overlay > p:not(.no-margin) > a[href*="tel:"]')?.innerText || null
        );

        const title = await page.$eval('.hero-section', (i) => i.querySelector('.hero-copy > h1')?.innerText || null);

        const description = await page.$eval(
          '.hero-section',
          (i) => i.querySelector('.hero-copy > h1 + *')?.innerHTML || i.querySelector('.hero-copy > h1 + *')?.innerHTML || null
        );

        const settigns = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector('main > div.flex-wrapper > div.row > div.background-color-gray > section > h2.heading-border');

          if (content && content?.innerText === 'Care Settings') {
            let list = [];
            const li = i.querySelectorAll(
              'main > div.flex-wrapper > div.row > div.background-color-gray > section > nav.links-related > ul > li'
            );
            li.forEach((item) =>
              list.push({
                src: item?.querySelector('a')?.href || null,
                copy: item?.innerText || null,
              })
            );

            return (content = {
              list,
              learnMore:
                i.querySelector('main > div.flex-wrapper > div.row > div.background-color-gray > section > a.button.primary')?.href || null,
            });
          }

          return null;
        });

        const featuresAmenities = await page.$eval('main > .flex-wrapper', (i) => {
          let content = i.querySelector(
            'main > div.flex-wrapper > div.row > div.background-color-white > section.content-section > h2.heading-border'
          );

          if (content && content?.innerText === 'Features & Amenities') {
            return (content = {
              content:
                i.querySelector('main > div.flex-wrapper > div.row > div.background-color-white > section.content-section > h2 + p')
                  ?.innerText || null,
              learnMore:
                i.querySelector('main > div.flex-wrapper > div.row > div.background-color-white > section.content-section > a.button')
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

        const recognitions = await page.$eval('main > div.umb-grid + div.flex-wrapper > div.row', (i) => {
          return {
            title: i.querySelector('div.content-section-Yes > section.grid-section > h2')?.innerText || null,
            content: i.querySelector('div.content-section-Yes > section.grid-section > h2 + *')?.innerText || null,
            image: i.querySelector('div.full-width-Yes > section.grid-section > figure > img')?.src || null,
            imageAlt: i.querySelector('div.full-width-Yes > section.grid-section > figure > img')?.alt || null,
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
        nursingImages.push(
          await page.$eval('main', (i) => {
            const image = i.querySelector('img')?.src;
            if (image !== null) return image;
          })
        );

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=Care Settings"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let careSettigns = [];
        if (menuLink && subpageTitle.includes('Care Settings')) {
          const careSettignsDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const shortTermCare = await page.$eval('main > div.umb-grid', (i) => {
            let root = 'div.grid-row > div.configured-1-Column > div.flex-row > div.span12 > section.grid-section > div.short-term';

            if (!document.querySelector(root))
              root = 'div.grid-row > div.configured-1-Column > div.flex-row > div.span12 > section.grid-section > div.medbridge';

            return {
              title: i.querySelector(`${root} > div.content-section-Yes > section.grid-section > h2`)?.innerText || null,
              content: i.querySelector(`${root} > div.content-section-Yes > section.grid-section > h2 + *:not(a)`)?.innerText || null,
              learnMore: i.querySelector(`${root} > div.content-section-Yes > section.grid-section > a`)?.href || null,
              image: i.querySelector(`${root} > div.background-color-DFEAEB > section.grid-section > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} > div.background-color-DFEAEB > section.grid-section > figure > img`)?.alt || null,
            };
          });

          const longTermCare = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-1-Column > div.flex-row > div.span12 > section.grid-section > div.long-term';

            return {
              title: i.querySelector(`${root} > div.content-section-Yes > section.grid-section > h2`)?.innerText || null,
              content: i.querySelector(`${root} > div.content-section-Yes > section.grid-section > h2 + *`)?.innerText || null,
              image: i.querySelector(`${root} > div.background-color-DFEAEB > section.grid-section > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} > div.background-color-DFEAEB > section.grid-section > figure > img`)?.alt || null,
            };
          });

          const outpatient = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.outpatient > div.configured-1-Column > div.flex-row > div.span12 > section.grid-section > div.flex-row';

            return {
              title: i.querySelector(`${root} > div.content-section-Yes > section.grid-section > h2`)?.innerText || null,
              content: i.querySelector(`${root} > div.content-section-Yes > section.grid-section > h2 + *`)?.innerText || null,
              image: i.querySelector(`${root} > div.background-color-DFEAEB > section.grid-section > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} > div.background-color-DFEAEB > section.grid-section > figure > img`)?.alt || null,
            };
          });

          careSettigns.push({
            careSettignsDescription: sanitize(careSettignsDescription),
            shortTermCare,
            longTermCare,
            outpatient,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          nursingImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval(
          '#main-menu',
          (item) => item.querySelector('a[href*="&contentNameString=Treatment Expertise"]')?.href || null
        );
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let treatmentExpertise = [];
        if (menuLink && subpageTitle.includes('Treatment Expertise')) {
          const treatmentExpertiseDescription = await page.$eval(
            '.hero-section',
            (i) => i.querySelector('.hero-overlay')?.innerHTML || null
          );

          const focusedTreatment = await page.$$eval(
            'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.section-item-padding-large > section.grid-section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return {
                title:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.section-item-padding-large > section.grid-section > h2'
                  )?.innerText || null,
                imgSrc:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.section-item-padding-vertical:not(.background-color-DFEAEB) > section.grid-section > figure > img'
                  )?.src || null,
                imgAlt:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.section-item-padding-vertical:not(.background-color-DFEAEB) > section.grid-section > figure > img'
                  )?.alt || null,
                services,
              };
            }
          );

          const treatmentAreas = await page.$$eval('div.grid-row > div.configured-2-Column > div.flex-row', (item) => {
            let areas = [];
            item.forEach((item) => {
              const title = item.querySelector('div.content-section-Yes > section.grid-section > h2')?.innerText || null;
              const imgSrc = item.querySelector('div.background-color-DFEAEB > section.grid-section > figure > img')?.src || null;
              const imgAlt = item.querySelector('div.background-color-DFEAEB > section.grid-section > figure > img')?.alt || null;

              const list = item.querySelectorAll(
                'div.content-section-Yes > section.grid-section > div.button-stack > div.row > div.col > a.button'
              );

              let buttons = [];
              list.forEach((item) =>
                buttons.push({
                  name: item?.innerText || null,
                  url: item?.href || null,
                })
              );

              areas.push({
                title,
                imgSrc,
                imgAlt,
                list: buttons,
              });
            });

            return areas;
          });

          treatmentExpertise.push({
            treatmentExpertiseDescription: sanitize(treatmentExpertiseDescription),
            focusedTreatment,
            treatmentAreas,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          nursingImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href$="Features and Amenities"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let amenities = [];
        if (menuLink && subpageTitle.includes('Features and Amenities')) {
          const amenitiesDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const generalAmenities = await page.$$eval(
            'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes:not(.background-color-FFFFFF) > section.grid-section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return {
                title:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                  )?.innerText || null,
                imgSrc:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                  )?.src || null,
                imgAlt:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > figure > img'
                  )?.alt || null,
                services,
              };
            }
          );

          const diningOptions = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section';

            return {
              title: i.querySelector(`${root} > h2`)?.innerText || null,
              content: i.querySelector(`${root} > h2 + *`)?.innerText || null,
              image: i.querySelector(`${root} > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} > figure > img`)?.alt || null,
            };
          });

          const activities = await page.$$eval(
            'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return {
                title:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > h2'
                  )?.innerText || null,
                imgSrc:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                  )?.src || null,
                imgAlt:
                  document.querySelector(
                    'main > div.umb-grid div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-FFFFFF > section.grid-section > figure > img'
                  )?.alt || null,
                services,
              };
            }
          );

          const rootGalleryButton =
            'main > div.umb-grid div.grid-row > div.configured-1-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > div.gallery-tours > div:nth-child(1) > section > div.image-overlay';
          const galleryButton = await page
            .locator(`${rootGalleryButton} > a[data-popup-ordinal="0"]`)
            .getByText('Photo Gallery')
            .isVisible();

          let photoGallery = null;
          if (galleryButton) {
            await page.click(`${rootGalleryButton} > a[data-popup-ordinal="0"]`);

            photoGallery = await page.$$eval(
              '#editor-image-gallery section.image-gallery-container > div.slick-slider > div.slick-list > div.slick-track > div.slick-slide > img',
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

          const rootVTButton =
            'main > div.umb-grid div.grid-row > div.configured-1-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section > div.gallery-tours > div:nth-child(2) > section > div.image-overlay';
          const vTourButton = await page.locator(`${rootVTButton} > a[href*="http"]`).getByText('Virtual Tour').first().isVisible();

          let virtualTour = null;
          if (vTourButton) {
            virtualTour = await page.locator(`${rootVTButton} > a[href*="http"]`).getByText('Virtual Tour').first().getAttribute('href');
          }

          amenities.push({
            amenitiesDescription: sanitize(amenitiesDescription),
            generalAmenities,
            diningOptions,
            activities,
            photoGallery,
            virtualTour,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          nursingImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Care Team"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let careTeam = [];
        if (menuLink && subpageTitle.includes('Care Team')) {
          const careTeamDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const yourTeam = await page.$$eval(
            'main > div.umb-grid div.content-row-No > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > ul > li',
            (item) => {
              let services = [];
              item.forEach((item) => services.push(item?.innerText));
              return {
                title:
                  document.querySelector(
                    'main > div.umb-grid div.content-row-No > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > h2'
                  )?.innerText || null,
                description:
                  document.querySelector(
                    'main > div.umb-grid div.content-row-No > div.configured-2-Column > div.flex-row > div.content-section-Yes > section.grid-section > p'
                  )?.innerText || null,
                imgSrc:
                  document.querySelector(
                    'main > div.umb-grid div.content-row-No > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                  )?.src || null,
                imgAlt:
                  document.querySelector(
                    'main > div.umb-grid div.content-row-No > div.configured-2-Column > div.flex-row > div.background-color-F8F8F5 > section.grid-section > figure > img'
                  )?.alt || null,
                services,
              };
            }
          );

          const champions = await page.$eval('main > div.umb-grid', (i) => {
            const root = 'div.grid-row > div.configured-2-Column > div.flex-row > div.background-color-DFEAEB > section.grid-section';

            return {
              title: i.querySelector(`${root} > h2`)?.innerText || null,
              content: i.querySelector(`${root} > h2 + *:not(a)`)?.innerText || null,
              anchor: i.querySelector(`${root} > a`)?.innerText || null,
              image: i.querySelector(`${root} > figure > img`)?.src || null,
              imageAlt: i.querySelector(`${root} > figure > img`)?.alt || null,
            };
          });

          careTeam.push({
            careTeamDescription: sanitize(careTeamDescription),
            yourTeam,
            champions,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          nursingImages.push(
            await page.$eval('main', (i) => {
              const image = i.querySelector('img')?.src;
              if (image !== null) return image;
            })
          );
        }

        menuLink = await page.$eval('#main-menu', (item) => item.querySelector('a[href*="&contentNameString=Payment"]')?.href || null);
        if (menuLink) {
          await page.goto(menuLink, { waitUntil: 'domcontentloaded' });
          subpageTitle = await page.title();
        }

        let payment = [];
        if (menuLink && subpageTitle.includes('Payment')) {
          const paymentDescription = await page.$eval('.hero-section', (i) => i.querySelector('.hero-overlay')?.innerHTML || null);

          const options = await page.$$eval(
            'main > div.umb-grid div.grid-row > div.configured-1-Column > div.flex-row > div.span12 > section.grid-section > div.inset-grid-lines > div.row > div.item-padding-overlay',
            (item) => {
              let options = [];
              item.forEach((item) =>
                options.push({
                  title: item?.querySelector('section > h2')?.innerText || null,
                  description: item?.querySelector('section > p')?.innerText || null,
                  anchor: item?.querySelector('section > a')?.href || null,
                })
              );
              return options;
            }
          );

          payment.push({
            paymentDescription: sanitize(paymentDescription),
            options,
          });

          // External Videos
          externalVideos.push(
            await page.$eval('main', (i) => {
              const video = i.querySelector('iframe[src*="vidyard"]');
              if (video !== null) return video.src;
            })
          );

          // Images
          nursingImages.push(
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

        skilledNursingDetails.push({
          id: i + 1,
          title: articlesTitle,
          url: links[i],
          metaTags,
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
            settigns,
            featuresAmenities,
            testimonials,
            recognitions,
            careSettigns,
            treatmentExpertise,
            amenities,
            careTeam,
            payment,
            moreInfo,
            contact,
            contactForm,
          },
        });

        console.log('Skilled Nursing', i + 1, 'Details Done');
      } catch (error) {
        console.log({ error });
        await page.close();
        await browser.close();
      }
    }
  }

  const jsonMemoryCareDetaills = JSON.stringify(skilledNursingDetails, null, 2);
  fs.writeFile('./json/ProMedica/agency/skilled-nursing-details.json', jsonMemoryCareDetaills, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nSkilled Nursing Details Imported!\n');
  });

  const jsonExternalVideos = JSON.stringify(
    externalVideos.filter((n) => n),
    null,
    2
  );
  fs.writeFile('./json/ProMedica/agency/Video/skilled-nursing-videos.json', jsonExternalVideos, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nExternal Videos Imported!\n');
  });

  const jsonExternalImages = JSON.stringify(
    nursingImages.filter((n) => n),
    null,
    2
  );
  fs.writeFile('./json/ProMedica/agency/Images/skilled-nursing-images.json', jsonExternalImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nImages Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
