import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function OurStories() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.promedica.org/newsroom/our-stories/?', { waitUntil: 'domcontentloaded' });

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

  let articles = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector('.ih-item');

      const articlesPerPage = await page.$$eval('.ih-item', (itemArticle) => {
        return itemArticle.map((article) => {
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
      console.log('Our Stories Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const mergeItems = articles.flat().map((item, index) => ({ id: index + 1, ...item }));
  const jsonArticles = JSON.stringify(mergeItems, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/Our Stories/our-stories.json', jsonArticles, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nOur Stories Imported!\n');
  });

  // Articles content
  const mergeLinks = mergeItems.map((item) => {
    if (item.linkSrc.startsWith('https://www.promedica.org/') && item.linkSrc !== 'https://www.promedica.org/newsroom/our-stories/?') {
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

        const articlesTitle = await page.title();
        const metaTags = await page.$$eval('meta', (meta) => meta.map((i) => i.outerHTML));

        const articleContent = await page.$eval('.ih-content-column', (i) => i.querySelector('#ih-page-body')?.innerHTML || null);

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

        console.log('Our Stories Article', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
        await page.close();
        await browser.close();
      }
    }
  }

  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/Our Stories/our-stories-articles.json', jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nOur Stories Articles Imported!\n');
  });

  const jsonArticlesImages = JSON.stringify(articleImages, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/Our Stories/our-stories-images.json', jsonArticlesImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("\nOur Stories Articles' Images Imported!\n");
  });

  // close page and browser
  await page.close();
  await browser.close();
}
