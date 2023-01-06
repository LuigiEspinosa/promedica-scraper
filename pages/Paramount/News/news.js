import fs from 'fs';
import { chromium } from 'playwright';

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

    articles.push({
      articles: articlesPerPage,
    });
  } catch (error) {
    console.log({ error });
  }

  const jsonContent = JSON.stringify(articles, null, 2);
  fs.writeFile('./json/Paramount/News/news.json', jsonContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log('Paramount News Imported!\n');
  });

  // Articles content
  const mergeLinks = articles[0].articles.map((item) => {
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

        const banner = await page.$eval('#article-banner > div.article-banner', (i) => {
          let img = i.querySelector('img');
          if (img) img.src;
        });

        const bannerAlt = await page.$eval('#article-banner > div.article-banner', (i) => {
          let imgAlt = i.querySelector('img');
          if (imgAlt) imgAlt = imgAlt.alt;
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
            content: articleContent,
          },
        });

        console.log('Educational Articles Article', i + 1, 'Done');
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
