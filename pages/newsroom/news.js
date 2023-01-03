import fs from 'fs';
import { chromium } from 'playwright';

export default async function News() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/newsroom/news/?', { waitUntil: 'networkidle' });

  await page.waitForSelector("a[aria-label='Next']");
  await page.click("a[aria-label='Next']");

  // get the elements in pagination
  await page.waitForSelector('ul.pagination li.active a');
  const numberPages = await page.$$eval('ul.pagination li.active a', (numberpages) => {
    return numberpages.map((numberPage) => {
      return parseInt(numberPage.innerText);
    });
  });

  const totalPages = Math.max(...numberPages.filter((p) => !isNaN(p)));

  await page.waitForSelector("a[aria-label='Previous']");
  await page.click("a[aria-label='Previous']");

  let articles = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector('.ih-item');

      const articlesPerPage = await page.$$eval('.ih-item', (headerArticle) => {
        return headerArticle.map((article) => {
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
        news: articlesPerPage,
      });

      console.log('News Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const eachItem = articles.map((item) =>
    item.news.map((card, idx) => {
      return { id: idx + 1, card };
    })
  );
  const mergeItems = [...new Set([].concat(...eachItem.map((item) => item)))];

  const jsonContent = JSON.stringify(mergeItems, null, 2);
  fs.writeFile('./json/newsroom/news.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nNews Imported!\n');
  });

  await page.close();
  await browser.close();
}
