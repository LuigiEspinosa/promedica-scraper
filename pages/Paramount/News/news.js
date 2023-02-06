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

    const articlesPerPage = await page.$$eval(
      '#resultsWrapper_3057afcf-c543-4c83-ac10-71bbd42e7454 > div.media',
      (articleItem) => {
        return articleItem.map((article, idx) => {
          const imgSrc = article.querySelector('.media-left img').src;
          const imgAlt = article.querySelector('.media-left img').alt;
          const title = article.querySelector('.media-body h2').innerText;
          const description = article.querySelector('.media-body p:nth-child(2)').innerText;
          const linkSrc = article.querySelector('.media-body a').href;
          const linkText = article.querySelector('.media-body a').innerText;

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
      }
    );

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
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('#page-body');

        const articlesTitle = await page.title();

        const banner = await page.$eval('#article-banner', (i) => {
          let banner = i.querySelector('#article-banner > div > img');
          if (banner) banner = banner.src;
          return banner;
        });

        const bannerAlt = await page.$eval('#article-banner', (i) => {
          let bannerAlt = i.querySelector('#article-banner > div > img');
          if (bannerAlt) bannerAlt = bannerAlt.alt;
          return bannerAlt;
        });

        const articleContent = await page.$eval(
          '#article-content',
          (i) => i.querySelector('div.row > div').innerHTML
        );

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

  await page.close();
  await browser.close();
}
