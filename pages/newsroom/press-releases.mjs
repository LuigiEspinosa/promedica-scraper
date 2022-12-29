import fs from 'fs'
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: true, // false if you can see the browser
  });
  const page = await browser.newPage();

  // navigate and wait until network is idle
  await page.goto(
    "https://www.promedica.org/newsroom/press-releases/?",
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
      // get the title of each article
      const articlesPerPage = await page.$$eval(
        ".ih-item",
        (headerArticle) => {
          return headerArticle.map((article) => {
            const title = article.querySelector(".row div h2.ih-title").innerText;
            const description = article.querySelector(".row div p").innerText;
            const linkSrc = article.querySelector(".row div a:not(.hidden)").href;
            const linkText = article.querySelector(".row div a:not(.hidden)").innerText;
            const imgSrc = article.querySelector(".row div img:not(.hidden)").src;
            const imgAlt = article.querySelector(".row div img:not(.hidden)").alt;

            return JSON.stringify({
              title,
              description,
              linkSrc,
              linkText,
              imgSrc,
              imgAlt,
            });
          });
        }
      );

      if (i != totalPages) {
        // by clicking the Next button
        await page.click(".pagination li.active + li a");
      }

      articles.push({
        site: 'Press Releases',
        page: i,
        articles: articlesPerPage,
      });

      console.log('Press Releases Page', i);
    } catch (error) {
      console.log({ error });
    }
  }

  const jsonContent = JSON.stringify(articles, null, 2)
  fs.writeFile("./json/newsroom/press-releases.json", jsonContent, 'utf8', function (err) {
    if (err) return console.log(err);
    console.log("Press Releases Imported!");
  });

  // close page and browser
  await page.close();
  await browser.close();
})();
