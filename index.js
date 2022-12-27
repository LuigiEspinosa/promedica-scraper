const { chromium } = require("playwright");

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
      await page.waitForSelector('.ih-title');
      // get the title of each article
      const articlesPerPage = await page.$$eval(
        ".ih-title",
        (headerArticle) => {
          return headerArticle.map((article) => {
            const title = article.innerText;

            return JSON.stringify({
              title,
            });
          });
        }
      );

      if (i != totalPages) {
        // by clicking the Next button
        await page.click(".pagination li.active + li a");
      }

      articles.push({
        page: i,
        articles: articlesPerPage,
      });

      console.log('Page: ', i);
    } catch (error) {
      console.log({ error });
    }
  }

  console.log(articles);

  // close page and browser
  await page.close();
  await browser.close();
})();
