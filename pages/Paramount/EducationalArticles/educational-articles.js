import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function EducationalArticles() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.paramounthealthcare.com/medicare/2023/educational-articles/', {
    waitUntil: 'networkidle',
  });

  let articles = [];

  try {
    await page.waitForSelector('#resultsWrapper_0bb4d5ab-4a87-438f-bfb4-2e234628f601');

    const articlesPerPage = await page.$$eval('#resultsWrapper_0bb4d5ab-4a87-438f-bfb4-2e234628f601 > div.row', (articleItem) => {
      return articleItem.map((article, idx) => {
        const imgSrc = article.querySelector('.row div img')?.src || null;
        const imgAlt = article.querySelector('.row div img')?.alt || null;
        const title = article.querySelector('.row div h2')?.innerText || null;
        const description = article.querySelector('.row div p')?.innerText || null;
        const linkSrc = article.querySelector('.row div a')?.href || null;
        const linkText = article.querySelector('.row div a')?.innerText || null;

        return {
          id: idx + 1,
          imgSrc,
          imgAlt,
          title,
          description,
          linkSrc,
          linkText,
        };
      });
    });

    articles.push(articlesPerPage);
  } catch (error) {
    console.log({ error });
  }

  const jsonContent = JSON.stringify(articles.flat(), null, 2);
  fs.writeFile('./json/Paramount/EducationalArticles/educational-articles.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('Educational Articles Imported!\n');
  });

  // Articles content
  const mergeLinks = articles.flat().map((item) => {
    if (item.linkSrc.startsWith('https://www.paramounthealthcare.com/')) {
      return item.linkSrc;
    }
  });

  let articlesBody = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('#page-body');

        const articlesTitle = await page.title();

        const banner = await page.$eval('#article-banner div.article-banner', (i) => i.querySelector('img')?.src || null);

        const bannerAlt = await page.$eval('#article-banner div.article-banner', (i) => i.querySelector('img')?.alt || null);

        const articleContent = await page.$eval('#article-content', (i) => i.querySelector('div.row > div')?.innerHTML || null);

        articlesBody.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          content: {
            banner,
            bannerAlt,
            body: sanitize(articleContent),
          },
        });

        console.log('Educational Articles Article', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2);
  fs.writeFile('./json/Paramount/EducationalArticles/educational-articles-articles.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("\nEducational Articles' Articles Imported!\n");
  });

  await page.close();
  await browser.close();
}
