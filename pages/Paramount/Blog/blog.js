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

    const articlesPerPage = await page.$$eval('#resultsWrapper_65e06b4f-b697-403e-a57e-6f47a40c9550 > div.row', (articleItem) => {
      return articleItem.map((article, idx) => {
        const imgSrc = article.querySelector('.col-md-3 img')?.src || null;
        const imgAlt = article.querySelector('.col-md-3 img')?.alt || null;
        const title = article.querySelector('.col-md-9 h2')?.innerText;
        const description = article.querySelector('.col-md-9 p:nth-child(3)')?.innerText || null;
        const linkSrc = article.querySelector('.col-md-9 a')?.href || null;

        return {
          id: idx + 1,
          imgSrc,
          imgAlt,
          title,
          description,
          linkSrc,
        };
      });
    });

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
  let articleImages = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('#page-body');

        const articlesTitle = await page.title();
        const metaTags = await page.$$eval('meta', (meta) => meta.map((i) => i.outerHTML));

        const banner = await page.$eval('#article-banner', (i) => i.querySelector('#article-banner > div > img')?.src || null);

        const bannerAlt = await page.$eval('#article-banner', (i) => i.querySelector('#article-banner > div > img')?.alt || null);

        const articleContent = await page.$eval('#article-content', (i) => i.querySelector('div.row > div')?.innerHTML || null);

        articlesBody.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          metaTags,
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

        console.log('Blog Articles', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
        await page.close();
        await browser.close();
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2);
  fs.writeFile('./json/Paramount/Blog/blog-articles.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nParamount Blog Articles Imported!\n');
  });

  const jsonArticlesImages = JSON.stringify(articleImages, null, 2);
  fs.writeFile('./json/Paramount/Blog/blog-articles-images.json', jsonArticlesImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("\nParamount Blog Articles' Images Imported!\n");
  });

  await page.close();
  await browser.close();
}
