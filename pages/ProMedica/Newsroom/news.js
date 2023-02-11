import fs from 'fs';
import { chromium } from 'playwright';
import sanitize from '../../../lib/sanitize.js';

export default async function News() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.promedica.org/newsroom/news/?', { waitUntil: 'domcontentloaded' });

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

      console.log('News Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const mergeItems = articles.flat().map((item, index) => ({ id: index + 1, ...item }));
  const jsonContent = JSON.stringify(mergeItems, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/News/news.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nNews Imported!\n');
  });

  // ProMedica News content
  const mergeLinks = mergeItems.map((item) => {
    if (item.linkSrc.startsWith('https://www.promedica.org/') && item.linkSrc !== 'https://www.promedica.org/newsroom/news/?') {
      return item.linkSrc;
    }
  });

  let newsBody = [];
  let newsImages = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) {
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' });

      try {
        let newsTitle = await page.title();

        // * 403 ERROR - Uncomment if necessary
        function delay(time) {
          return new Promise(function (resolve) {
            setTimeout(resolve, time);
          });
        }

        while (newsTitle.includes('ERROR')) {
          let wait = 200000;

          console.log('403 ERROR DETECTED');
          await delay(wait);
          wait = wait * 2;

          console.log('RELOADING PAGE');
          await page.reload();
          newsTitle = await page.title();
        }

        await page.waitForSelector('.ih-content-column');

        const newsContent = await page.$eval('.ih-content-column', (i) => i.querySelector('#ih-page-body')?.innerHTML || null);

        newsBody.push({
          id: i + 1,
          title: newsTitle,
          url: mergeLinks[i],
          content: sanitize(newsContent),
        });

        const allImg = await page.$$eval('.ih-content-column img', (img) => img.map((i) => i.src));
        newsImages.push({
          article: newsTitle,
          images: allImg,
        });

        console.log('News Articles', i + 1, 'Done');
      } catch (error) {
        console.log({ error });
      }
    }
  }

  const jsonNewsContent = JSON.stringify(newsBody, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/News/news-articles.json', jsonNewsContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('\nNews Articles Imported!\n');
  });

  const jsonNewsImages = JSON.stringify(newsImages, null, 2);
  fs.writeFile('./json/ProMedica/newsroom/News/news-articles-images.json', jsonNewsImages, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("\nNews Articles' Images Imported!\n");
  });

  await page.close();
  await browser.close();
}
