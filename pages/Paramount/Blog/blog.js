import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function ParamountBlog() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.paramounthealthcare.com/blog', {
    waitUntil: 'networkidle',
  });

  let articles = [];

  try {
    await page.waitForSelector('#resultsWrapper_65e06b4f-b697-403e-a57e-6f47a40c9550');

    const articlesPerPage = await page.$$eval(
      '#resultsWrapper_65e06b4f-b697-403e-a57e-6f47a40c9550 > div.row',
      (articleItem) => {
        return articleItem.map((article, idx) => {
          const imgSrc = article.querySelector('.col-md-3 img').src;
          const imgAlt = article.querySelector('.col-md-3 img').alt;
          const title = article.querySelector('.col-md-9 h2').innerText;
          const description = article.querySelector('.col-md-9 p:nth-child(3)').innerText;
          const linkSrc = article.querySelector('.col-md-9 a').href;

          return {
            id: idx + 1,
            imgSrc,
            imgAlt,
            title,
            description,
            linkSrc,
          };
        });
      }
    );

    articles.push(articlesPerPage);
  } catch (error) {
    console.log({ error });
  }

  const jsonContent = JSON.stringify(articles.flat(), null, 2);
  fs.writeFile('./json/Paramount/Blog/blog.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('Paramount Blog Imported!\n');
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

        console.log('Blog Articles', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2);
  fs.writeFile('./json/Paramount/Blog/blog-articles.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nParamount Blog Articles Imported!\n');
  });

  await page.close();
  await browser.close();
}
