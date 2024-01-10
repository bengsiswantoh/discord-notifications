const puppeteer = require('puppeteer');

const tokopedia = async () => {
  let browser;
  try {
    // browser = puppeteer.connect({browserWSEndpoint: ''})
    browser = await puppeteer.launch({ headless: 'new' });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(1 * 60 * 1000);

    await page.goto(
      'https://www.tokopedia.com/ineedriceid/beras-merah-5kg-dua-tani?extParam=whid%3D13056835'
    );

    const selector = '.price';

    await page.waitForSelector(selector);
    const el = await page.$(selector);

    const text = await el.evaluate((e) => e.innerHTML);

    console.log(text);

    return;
  } catch (error) {
    console.log('failed', error);
  } finally {
    await browser?.close();
  }
};

module.exports = tokopedia;
