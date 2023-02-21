import fs from 'fs';
import { chromium } from 'playwright';
import timeoutError from '../../../lib/403.js';
import sanitize from '../../../lib/sanitize.js';

export default async function Pressreleases() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/newsroom/press-releases/?', {
    waitUntil: 'domcontentloaded',
  });

  let articlesTitle = await page.title();
  await timeoutError(articlesTitle, page);

  await page.waitForSelector("a[aria-label='Next']");
  await page.click("a[aria-label='Next']");

  // Get the elements in pagination
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
      articlesTitle = await page.title();
      await timeoutError(articlesTitle, page);

      await page.waitForSelector('.ih-item');

      const articlesPerPage = await page.$$eval('.ih-item', (headerArticle) => {
        return headerArticle.map((article) => {
          const title = article.querySelector('.row div h2.ih-title')?.innerText || null;
          const description = article.querySelector('.row div p')?.innerText || null;
          const linkSrc = article.querySelector('.row div a:not(.hidden)')?.href || null;
          const linkText = article.querySelector('.row div a:not(.hidden)')?.innerText || null;
          const imgSrc = article.querySelector('.row div img:not(.hidden)')?.src || null;
          const imgAlt = article.querySelector('.row div img:not(.hidden)')?.alt || null;

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

      articles.push(articlesPerPage);

      console.log('Press Releases Page', i, 'Done');
    } catch (error) {
      console.log({ error });
      await page.close();
      await browser.close();
    }
  }

  const mergeItems = articles.flat().map((item, index) => ({ id: index + 1, ...item }));
  const jsonContent = JSON.stringify(mergeItems, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/Press Releases/press-releases.json', jsonContent, 'utf8', function (err) {
    if (err) return console.log(err);
    console.log('\nPress Releases Imported!\n');
  });

  // Press Release content
  const mergeLinks = mergeItems.map((item) => {
    if (item.linkSrc.startsWith('https://www.promedica.org/') && item.linkSrc !== 'https://www.promedica.org/newsroom/press-releases/?') {
      return item.linkSrc;
    }
  });

  let articlesBody = [];
  let articleImages = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector('.ih-content-column');

        articlesTitle = await page.title();
        await timeoutError(articlesTitle, page);

        const metaTags = await page.$$eval('meta', (meta) => meta.map((i) => i.outerHTML));
        const articleContent = await page.$eval('.ih-content-column', (i) => i.querySelector('#ih-page-body')?.innerHTML);

        articlesBody.push({
          id: i + 1,
          title: articlesTitle,
          url: mergeLinks[i],
          metaTags,
          content: sanitize(articleContent),
        });

        const allImg = await page.$$eval('.ih-content-column img', (img) => img.map((i) => i.src));
        articleImages.push({
          article: articlesTitle,
          images: allImg,
        });

        console.log('Press Releases Article', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
        await page.close();
        await browser.close();
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/Press Releases/press-releases-articles.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('Press Releases Articles Imported!\n');
  });

  const jsonArticlesImages = JSON.stringify(articleImages, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/Press Releases/press-releases-images.json', jsonArticlesImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("\nPress Releases Articles' Images Imported!\n");
  });

  await page.close();
  await browser.close();
}
