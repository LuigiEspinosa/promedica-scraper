import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function ServicesConditions() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/services-and-conditions/', {
    waitUntil: 'domcontentloaded',
  });

  const alphabeticalSelectors = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  const totalSelectors = alphabeticalSelectors.length - 1;

  let servicesConditions = [];
  for (let i = 0; i <= totalSelectors; i++) {
    try {
      if (i === 0) {
        await page.click('#select_A');
      }

      await page.waitForSelector('#resultsWrapper_serviceSearchResults');

      const servicesCards = await page.$$eval('#resultsWrapper_serviceSearchResults > div', (cardItem) => {
        return cardItem.map((card) => {
          const name = card.querySelector('.service-text .service-name')?.innerText || null;
          const description = card.querySelector('.service-text .service-desc > div > p > span')?.innerText || null;
          const providers = card.querySelector('.service-text .service-links > a[href*="/find-a-doctor"]')?.href || null;
          const locations = card.querySelector('.service-text .service-links > a[href*="/find-locations"]')?.href || null;
          const details = card.querySelector('a.btn.btn-primary')?.href || null;

          return {
            name,
            description,
            providers,
            locations,
            details,
          };
        });
      });

      if (i < totalSelectors) {
        await page.click(`#select_${alphabeticalSelectors[i + 1]}`);
      }

      servicesConditions.push(servicesCards);
      console.log('Services & Conditions Page', i + 1, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const mergeServices = servicesConditions.flat().map((item, index) => ({ id: index + 1, ...item }));

  const jsonServicesConditions = JSON.stringify(mergeServices, null, 2);
  fs.writeFile('./json/ProMedica/services-conditions/services-conditions.json', jsonServicesConditions, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nServices & Conditions Imported!\n');
  });

  // Services & Conditions content
  const mergeLinks = mergeServices.map((item) => {
    if (item.details !== null && item.details.startsWith('https://www.promedica.org/services-and-conditions')) {
      return item.details;
    }
  });

  let servicesBody = [];
  let servicesImages = [];

  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        const articlesTitle = await page.title();

        const articleContent = await page.$eval('#ih-page-body', (i) => i.querySelector('.row > div')?.innerHTML || null);

        const about = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="about"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const interest = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="interest"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const whatIs = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="whatIs"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const getStarted = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('#ih-page-footer div.panel h2');
          if (content && content.innerText === 'Getting Started on Your Bariatric Journey') return content.parentElement.innerHTML;
          return null;
        });

        const toKnow = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('#ih-page-footer div > div > div.panel > div > div > h2');
          if (content && content.innerText === 'Things to Know') return content.parentElement.innerHTML;
          return null;
        });

        const journey = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('#ih-page-footer div.panel h2.alt');
          if (content && content.innerText === 'Understanding Your Bariatric Journey') return content.parentElement.innerHTML;
          return null;
        });

        const dvtSymptoms = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('#ih-page-footer div.panel h3');
          if (content && content.innerText === 'WHAT ARE THE SYMPTOMS OF A DVT?') return content.parentElement.innerHTML;
          return null;
        });

        const dvtRisks = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('#ih-page-footer > div > div > div:not(.panel) > h3');
          if (content && content.innerHTML === 'What are your risks for forming a&nbsp;DVT?') return content.parentElement.innerHTML;
          return null;
        });

        const mammogram = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('#ih-page-footer > div > div > .mammogram-section > div > div');
          if (content) return content.parentElement.innerHTML;
          return null;
        });

        const mobile = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('#ih-page-footer > div > div.row > div.panel > div.mobile-indent:nth-child(1)');
          if (content) return content.parentElement.innerHTML;
          return null;
        });

        const toledo = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="toledo"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const clinic = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="clinic"]') || i.querySelector('a[name="clinics"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const overview = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="overview"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const programs = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="programs"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const scaleDown = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="scaleDown"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const approach = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="approach"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const development = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="development"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const safety = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="safety"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const expect = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="expect"]') || i.querySelector('a[name="whatToExpect"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const signs = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="signs"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const care = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="care"]') || i.querySelector('a[name="connectedCare"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const survivorship = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="survivorship"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const risks = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="risks"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const injuries = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="injuries"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const disorders = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="disorders"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const causes = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="causes"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const services = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="services"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const donations = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="donations"]') || i.querySelector('a[name="donate"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const support = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="support"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const devices = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="devices"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const management = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="management"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const understanding = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="understanding"]') || i.querySelector('a[name="understand"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const prevention = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="prevention"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const spine = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="spine"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const diabetes = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="diabetes"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const maleUrology = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="maleUrology"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const urologicCancer = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="urologicCancer"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const aboutProstateCancer = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="aboutProstateCancer"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const heartHealth = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="heartHealth"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const bodyAndBreast = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="bodyAndBreast"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const facialProcedures = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="facialProcedures"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const eyeHealth = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="eyeHealth"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const eyewear = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="eyewear"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const talking = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="talking"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const ourProgram = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="program"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const ourExpertise = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="expertise"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const ourTeam = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="ourTeam"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const patientStories = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="patientStories"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const faq = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="faq"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const conditions = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="conditions"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const resources = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="resources"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const symptoms = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="symptoms"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const procedures = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="procedures"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const beforeAfter = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="beforeAfter"]') || i.querySelector('a[name="bafSurgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const before = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="before"]') || i.querySelector('a[name="beforeSurgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const after = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="after"]') || i.querySelector('a[name="afterSurgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const surgery = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="surgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const surgicalProcedures = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="surgicalProcedures"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const typesOfSurgery = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="typesOfSurgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const roboticSurgery = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="roboticSurgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const specialtySurgery = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="specialtySurgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const bariatricSurgery = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="bariatricSurgery"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const diagnosis = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="diagnosis"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const types = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="types"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const treatment = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="treatment"]') || i.querySelector('a[name="treatments"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const primarycare = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="primarycare"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const specials = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="specials"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const specialties = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="specialties"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const emergency = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="emergency"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const yourVisit = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="yourVisit"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const prepareToQuit = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="prepareToQuit"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const aboutTobacco = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="aboutTobacco"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        const contact = await page.$eval('#ih-page-footer', (i) => {
          let content = i.querySelector('a[name="contact"]') || i.querySelector('a[name="contactUs"]');
          if (content) content = content.parentElement.innerHTML;
          return content;
        });

        let providers;
        providers = await page.$$eval('#resultsWrapper_serviceProviders > div', (item) => {
          return item.map((item) => {
            const imageSrc = item.querySelector('.card > a > img')?.src || null;
            const imageAlt = item.querySelector('.card > a > img')?.alt || null;
            const name = item.querySelector('.card .prov-name')?.innerText || null;
            const phone = item.querySelector('.card .prov-phone > a')?.innerText || null;
            const specialty = item.querySelector('.card .prov-specialty')?.innerText || null;
            const location = item.querySelector('.card .prov-locations')?.innerText || null;
            const details = item.querySelector('.card a.btn.btn-primary')?.href || null;

            let newPatients = item.querySelector('.card .prov-accept-new');
            newPatients ? (newPatients = true) : (newPatients = false);

            return {
              imageSrc,
              imageAlt,
              name,
              phone,
              specialty,
              location,
              newPatients,
              details,
            };
          });
        });

        if (providers.length <= 0) {
          await page.waitForSelector('#customList').catch((err) => (providers = err));
          providers = await page.$$eval('.related-providers > div > .panel > #customList > div > div', (item) => {
            return item.map((item) => {
              const imageSrc = item.querySelector('.card > a > img')?.src || null;
              const imageAlt = item.querySelector('.card > a > img')?.alt || null;
              const name = item.querySelector('.card .prov-name')?.innerText || null;
              const phone = item.querySelector('.card .prov-phone > a')?.innerText || null;
              const specialty = item.querySelector('.card .prov-specialty')?.innerText || null;
              const location = item.querySelector('.card .prov-locations')?.innerText || null;
              const details = item.querySelector('.card a.btn.btn-primary')?.href || null;

              let newPatients = item.querySelector('.card .prov-accept-new');
              newPatients ? (newPatients = true) : (newPatients = false);

              return {
                imageSrc,
                imageAlt,
                name,
                phone,
                specialty,
                location,
                newPatients,
                details,
              };
            });
          });
        }

        const moreProviders = await page.$eval('#ih-page-footer', (i) => i.querySelector('.related-providers #viewMoreProv')?.href || null);

        let locations;
        locations = await page.$$eval('#resultsWrapper_serviceLocations > div', (item) => {
          return item.map((item) => {
            let imageSrc = item.querySelector('.card > img')?.src || null;
            let imageAlt = item.querySelector('.card > img')?.alt || null;
            let name = item.querySelector('.card .loc-name')?.innerText || null;
            let city = item.querySelector('.card .loc-city')?.innerText || null;
            let add1 = item.querySelector('.card .loc-add-1')?.innerText || null;
            let add2 = item.querySelector('.card .loc-add-2')?.innerText || null;
            let phone = item.querySelector('.card .loc-phone > a')?.innerText || null;
            let details = item.querySelector('.card a.btn.btn-primary')?.href || null;

            return {
              imageSrc,
              imageAlt,
              name,
              city,
              add1,
              add2,
              phone,
              details,
            };
          });
        });

        if (locations.length <= 0) {
          await page.waitForSelector('#customList').catch((err) => (locations = err));
          locations = await page.$$eval('.related-locations > div > .panel > #customList > div > div', (item) => {
            return item.map((item) => {
              let imageSrc = item.querySelector('.card > img')?.src || null;
              let imageAlt = item.querySelector('.card > img')?.alt || null;
              let name = item.querySelector('.card .loc-name')?.innerText || null;
              let city = item.querySelector('.card .loc-city')?.innerText || null;
              let add1 = item.querySelector('.card .loc-add-1')?.innerText || null;
              let add2 = item.querySelector('.card .loc-add-2')?.innerText || null;
              let phone = item.querySelector('.card .loc-phone > a')?.innerText || null;
              let details = item.querySelector('.card a.btn.btn-primary')?.href || null;

              return {
                imageSrc,
                imageAlt,
                name,
                city,
                add1,
                add2,
                phone,
                details,
              };
            });
          });
        }

        const moreLocations = await page.$eval('#ih-page-footer', (i) => i.querySelector('.related-locations #viewMoreLoc')?.href || null);

        servicesBody.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          content: {
            articleContent: sanitize(articleContent),
            about: sanitize(about),
            interest: sanitize(interest),
            whatIs: sanitize(whatIs),
            getStarted: sanitize(getStarted),
            toKnow: sanitize(toKnow),
            journey: sanitize(journey),
            dvtSymptoms: sanitize(dvtSymptoms),
            dvtRisks: sanitize(dvtRisks),
            mammogram: sanitize(mammogram),
            mobile: sanitize(mobile),
            toledo: sanitize(toledo),
            clinic: sanitize(clinic),
            overview: sanitize(overview),
            programs: sanitize(programs),
            scaleDown: sanitize(scaleDown),
            approach: sanitize(approach),
            development: sanitize(development),
            safety: sanitize(safety),
            expect: sanitize(expect),
            signs: sanitize(signs),
            care: sanitize(care),
            survivorship: sanitize(survivorship),
            risks: sanitize(risks),
            injuries: sanitize(injuries),
            disorders: sanitize(disorders),
            causes: sanitize(causes),
            services: sanitize(services),
            donations: sanitize(donations),
            support: sanitize(support),
            devices: sanitize(devices),
            management: sanitize(management),
            understanding: sanitize(understanding),
            prevention: sanitize(prevention),
            spine: sanitize(spine),
            diabetes: sanitize(diabetes),
            maleUrology: sanitize(maleUrology),
            urologicCancer: sanitize(urologicCancer),
            aboutProstateCancer: sanitize(aboutProstateCancer),
            heartHealth: sanitize(heartHealth),
            bodyAndBreast: sanitize(bodyAndBreast),
            facialProcedures: sanitize(facialProcedures),
            eyeHealth: sanitize(eyeHealth),
            eyewear: sanitize(eyewear),
            talking: sanitize(talking),
            ourProgram: sanitize(ourProgram),
            ourExpertise: sanitize(ourExpertise),
            ourTeam: sanitize(ourTeam),
            patientStories: sanitize(patientStories),
            faq: sanitize(faq),
            conditions: sanitize(conditions),
            resources: sanitize(resources),
            symptoms: sanitize(symptoms),
            procedures: sanitize(procedures),
            beforeAfter: sanitize(beforeAfter),
            before: sanitize(before),
            after: sanitize(after),
            surgery: sanitize(surgery),
            surgicalProcedures: sanitize(surgicalProcedures),
            typesOfSurgery: sanitize(typesOfSurgery),
            roboticSurgery: sanitize(roboticSurgery),
            specialtySurgery: sanitize(specialtySurgery),
            bariatricSurgery: sanitize(bariatricSurgery),
            diagnosis: sanitize(diagnosis),
            types: sanitize(types),
            treatment: sanitize(treatment),
            prepareToQuit: sanitize(prepareToQuit),
            aboutTobacco: sanitize(aboutTobacco),
            contact: sanitize(contact),
            yourVisit: sanitize(yourVisit),
            primarycare: sanitize(primarycare),
            specials: sanitize(specials),
            specialties: sanitize(specialties),
            emergency: sanitize(emergency),
            providers,
            moreProviders,
            locations,
            moreLocations,
          },
        });

        console.log('Services & Conditions Article', i + 1, 'Done');

        const allImg = await page.$$eval('#site-body img', (img) => img.map((i) => i.src));
        servicesImages.push({
          article: articlesTitle,
          images: allImg,
        });

        console.log('Images from Article', i + 1, 'Done');
      } catch (error) {
        await page.close();
        await browser.close();
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(servicesBody, null, 2);
  fs.writeFile('./json/ProMedica/services-conditions/services-conditions-articles.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nServices & Conditions Articles Imported!\n');
  });

  const jsonArticlesImages = JSON.stringify(servicesImages, null, 2);
  fs.writeFile('./json/ProMedica/services-conditions/services-conditions-images.json', jsonArticlesImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nServices & Conditions Images Imported!\n');
  });

  // close page and browser
  await page.close();
  await browser.close();
}
