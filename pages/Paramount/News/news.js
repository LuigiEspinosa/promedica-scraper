import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function ParamountNews() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.paramounthealthcare.com/news/', {
    waitUntil: 'networkidle',
  });

  let articles = [];

  try {
    await page.waitForSelector('#resultsWrapper_3057afcf-c543-4c83-ac10-71bbd42e7454');

    const articlesPerPage = await page.$$eval('#resultsWrapper_3057afcf-c543-4c83-ac10-71bbd42e7454 > div.media', (articleItem) => {
      return articleItem.map((article, idx) => {
        const imgSrc = article.querySelector('.media-left img')?.src || null;
        const imgAlt = article.querySelector('.media-left img')?.alt || null;
        const title = article.querySelector('.media-body h2')?.innerText || null;
        const description = article.querySelectorAll('.media-body p')[1]?.innerText || null;
        const linkSrc = article.querySelector('.media-body a')?.href || null;
        const linkText = article.querySelector('.media-body a')?.innerText || null;

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
  fs.writeFile('./json/Paramount/News/news.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('Paramount News Imported!\n');
  });

  // Articles content
  const mergeLinks = articles.flat().map((item) => {
    if (item.linkSrc.startsWith('https://www.paramounthealthcare.com/')) {
      return item.linkSrc;
    }
  });

  let articlesBody = [];
  let articleImages = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('#page-body');

        const articlesTitle = await page.title();

        const banner = await page.$eval('#article-banner', (i) => i.querySelector('#article-banner > div > img')?.src || null);

        const bannerAlt = await page.$eval('#article-banner', (i) => i.querySelector('#article-banner > div > img')?.alt || null);

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

        const allImg = await page.$$eval('#page-body img', (img) => img.map((i) => i.src));
        articleImages.push({
          article: articlesTitle,
          images: allImg,
        });

        console.log('News Article', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2);
  fs.writeFile('./json/Paramount/News/news-articles.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nParamount News Articles Imported!\n');
  });

  const jsonArticlesImages = JSON.stringify(articleImages, null, 2);
  fs.writeFile('./json/Paramount/News/news-articles-images.json', jsonArticlesImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("\nParamount News Articles' Images Imported!\n");
  });

  await page.close();
  await browser.close();
}
