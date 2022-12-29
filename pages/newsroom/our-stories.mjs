import fs from 'fs'
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // navigate and wait until network is idle
  await page.goto(
    "https://www.promedica.org/newsroom/our-stories/?",
    { waitUntil: 'networkidle' }
  );

  await page.waitForSelector("a[aria-label='Next']"); // wait for the element
  await page.click("a[aria-label='Next']");

  // get the elements in pagination
  await page.waitForSelector("ul.pagination li.active a");
  const numberPages = await page.$$eval("ul.pagination li.active a", (numberpages) => {
    return numberpages.map((numberPage) => {
      return parseInt(numberPage.innerText);
    });
  });

  // get total pages in pagination
  const totalPages = Math.max(...numberPages.filter((p) => !isNaN(p)));

  // Back to first page
  await page.waitForSelector("a[aria-label='Previous']");
  await page.click("a[aria-label='Previous']");

  // get the articles per page
  let articles = [];
  for (let i = 1; i <= totalPages; i++) {
    try {
      await page.waitForSelector('.ih-item');
      // get the content of each card
      const articlesPerPage = await page.$$eval(
        ".ih-item",
        (itemArticle) => {
          return itemArticle.map((article) => {
            const title = article.querySelector(".row div h2.ih-title").innerText;
            const description = article.querySelector(".row div p").innerText;
            const linkSrc = article.querySelector(".row div a:not(.hidden)").href;
            const linkText = article.querySelector(".row div a:not(.hidden)").innerText;
            const imgSrc = article.querySelector(".row div img:not(.hidden)").src;
            const imgAlt = article.querySelector(".row div img:not(.hidden)").alt;
            
            return {
              title,
              description,
              linkSrc,
              linkText,
              imgSrc,
              imgAlt
            };
          });
        }
      );

      if (i != totalPages) {
        // by clicking the Next button
        await page.click(".pagination li.active + li a");
      }

      articles.push({
        site: 'Our Stories',
        page: i,
        articles: articlesPerPage,
      });

      console.log('Our Stories Page', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }

  const allArticlesLink = articles.map(item => item.articles.map(src => src.linkSrc))
  const mergeLinks = [...new Set([].concat(...allArticlesLink.map((src) => src)))]

  // Articles content
  let articlesBody = [];
  for (let i = 0; i <= mergeLinks.length; i++) {
    if (mergeLinks[i] !== undefined) 
      await page.goto(mergeLinks[i], { waitUntil: 'domcontentloaded' })

    try {
      await page.waitForSelector('.ih-content-column');

      // get the content of each article
      const articlesTitle = await page.$eval(
        ".ih-content-column",
        (itemArticle) => {
          return itemArticle.querySelector("#ih-page-body > div:first-of-type").innerText
        }
      );

      // get the content of each article
      const articleContent = await page.$eval(
        ".ih-content-column",
        (itemArticle) => {
          return itemArticle.querySelector("#ih-page-body").innerHTML;
        }
      );

      articlesBody.push({
        id: i + 1,
        site: articlesTitle,
        content: articleContent,
      });

      console.log('Our Stories Article', i, 'Done');
    } catch (error) {
      console.log({ error });
    }
  }
  
  const jsonArticles = JSON.stringify(articles, null, 2)
  fs.writeFile("./json/newsroom/Our Stories/our-stories.json", jsonArticles, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("Our Stories Imported!");
  });
  
  const jsonArticlesContent = JSON.stringify(articlesBody, null, 2)
  fs.writeFile("./json/newsroom/Our Stories/our-stories-articles.json", jsonArticlesContent, 'utf8', (err) => {
    if (err) return console.log(err);
    console.log("Our Stories Articles Imported!");
  });

  // close page and browser
  await page.close();
  await browser.close();
})();

