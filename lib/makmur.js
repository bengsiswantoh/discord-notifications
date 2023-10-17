require('dotenv').config();
require('dayjs/locale/id');
const cheerio = require('cheerio');

const dayjs = require('dayjs');
dayjs.locale('id');

const { writeFile, readJSONFile } = require('../helper/data');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const getMonths = () => {
  const formatMonth = 'MMM';
  const months = [];
  const now = dayjs();

  const monthNow = now.format(formatMonth);
  const monthYesterday = now.subtract(1, 'day').format(formatMonth);

  months.push(monthNow);
  if (monthNow !== monthYesterday) {
    months.push(monthYesterday);
  }

  return months;
};

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.makmur.source);
    const responseText = await response.text();

    result = [];

    const $ = cheerio.load(responseText);
    $('a').each((idx, el) => {
      const href = el.attribs.href;
      let name;
      let date;

      if (href.includes('/id/blog/promo/')) {
        const element = $(el);

        const children = element
          .children('div')
          .children('div')
          .next()
          .children('div')
          .next();

        const name = children.children('div').html();
        const date = children
          .next()
          .children('div')
          .next()
          .children('div[color=darkGrey]')
          .html();

        const url = website.makmur.generate + href;

        result.push({ url, date, name });
      }
    });
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const makmur = async () => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const filename = fileData.makmur;

    const [data, dataError] = await readJSONFile(filename, []);
    const [items, itemsError] = await getItems();

    if (dataError || itemsError) {
      return;
    }

    let content = '';
    for (const promo of items) {
      const { url, date, name } = promo;

      const found = data.find((item) => item.url === url);
      if (!found) {
        content += `\n${date}`;
        content += `\n${name}`;
        content += `\n${url}\n`;
      }
    }
    const urls = process.env.DISCORD_MAKMUR.split(',');
    await sendDiscordContents(content, urls);

    // update data
    if (env === 'production') {
      writeFile(filename, items);
    }
  } catch (err) {
    await sendAlert(err);
  }
};

module.exports = makmur;
