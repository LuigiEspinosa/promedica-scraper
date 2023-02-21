function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export default async function timeoutError(title, page) {
  while (title.includes('ERROR')) {
    let wait = 200000;

    console.log('\n403 ERROR DETECTED');
    await delay(wait);
    wait = wait * 2;

    console.log('RELOADING PAGE\n');
    await page.reload();
    title = await page.title();
  }

  return false;
}
