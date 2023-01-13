import fs from 'fs';
import { chromium } from 'playwright';

export default async function OurStories() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.promedica.org/newsroom/our-stories/?', { waitUntil: 'networkidle' });

  await page.waitForSelector("a[aria-label='Next']");
  await page.click("a[aria-label='Next']");

  await page.waitForSelector('ul.pagination li.active a');
  const numberPages = await page.$$eval('ul.pagination li.active a', (numberpages) => {
    return numberpages.map((numberPage) => {
      return parseInt(numberPage.innerText);
    });
  });

  const totalPages = Math.max(...numberPages.filter((p) => !isNaN(p)));

  await page.waitForSelector("a[aria-label='Previous']");
  await page.click("a[aria-label='Previous']");

  // get the articles per page
  let articles = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector('.ih-item');

      const articlesPerPage = await page.$$eval('.ih-item', (itemArticle) => {
        return itemArticle.map((article) => {
          const title = article.querySelector('.row div h2.ih-title').innerText;
          const description = article.querySelector('.row div p').innerText;
          const linkSrc = article.querySelector('.row div a:not(.hidden)').href;
          const linkText = article.querySelector('.row div a:not(.hidden)').innerText;
          const imgSrc = article.querySelector('.row div img:not(.hidden)').src;
          const imgAlt = article.querySelector('.row div img:not(.hidden)').alt;

          return {
            title,
            description,
            linkSrc,
            linkText,
            imgSrc,
            imgAlt,
          };
        });
      });

      if (i != totalPages) {
        await page.click('.pagination li.active + li a');
      }

      articles.push({
        articles: articlesPerPage,
      });

      console.log('Our Stories Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const eachItem = articles.map((item, idx) =>
    item.articles.map((card, i) => {
      return { id: parseFloat(`${idx + 1}.${i}`), card };
    })
  );
  const mergeItems = [...new Set([].concat(...eachItem.map((item) => item)))];

  const jsonArticles = JSON.stringify(mergeItems, null, 2);
  fs.writeFile(
    './json/ProMedica/newsroom/Our Stories/our-stories.json',
    jsonArticles,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nOur Stories Imported!\n');
    }
  );

  // Articles content
  const mergeLinks = mergeItems.map((item) => {
    if (
      item.card.linkSrc.startsWith('https://www.promedica.org/') &&
      item.card.linkSrc !== 'https://www.promedica.org/newsroom/our-stories/?'
    ) {
      return item.card.linkSrc;
    }
  });

  let articlesBody = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('.ih-content-column');

        const articlesTitle = await page.title();
        const articleContent = await page.$eval(
          '.ih-content-column',
          (i) => i.querySelector('#ih-page-body').innerHTML
        );

        articlesBody.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          content: articleContent,
        });

        console.log('Our Stories Article', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2);
  fs.writeFile(
    './json/ProMedica/newsroom/Our Stories/our-stories-articles.json',
    jsonArticlesContent,
    'utf8',
    (err) => {
      if (err) return console.log(err);
      console.log('\nOur Stories Articles Imported!\n');
    }
  );

  // close page and browser
  await page.close();
  await browser.close();
}
