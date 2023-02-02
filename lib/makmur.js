require('dotenv').config();
require('dayjs/locale/id');
const cheerio = require('cheerio');

const dayjs = require('dayjs');
dayjs.locale('id');

const { writeFile, readJSONFile } = require('../helper/data');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

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

      if (href.includes('post')) {
        const element = $(el);
        const children = element.children('div');
        const childrenLength = children.length;

        const divPrimary = 'div[color=primary]';
        const divBlack = 'div[color=black]';

        let promo = false;

        if (childrenLength === 1) {
          promo = true;
          name = children.children(divBlack).html();
          date = children.children('div').children(divBlack).html();
        }

        if (childrenLength === 2) {
          const type = children.children(divPrimary).html();
          date = children.children(divBlack).html();
          name = element.children(divBlack).html();

          if (type === 'PROMO') {
            promo = true;
          }
        }

        if (promo) {
          date = date.split(' ').slice(-2).join(' ');

          result.push({ url: website.makmur.generate + href, date, name });
        }
      }
    });
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

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

const makmur = async () => {
  const env = process.env.NODE_ENV || 'development';

  const [data, dataError] = await readJSONFile(fileData.makmur, []);
  const [items, itemsError] = await getItems();

  const months = getMonths();

  let content = '';
  for (const promo of items) {
    const { url, date, name } = promo;

    const found = data.find((item) => item.url === url);
    const dates = date.split(' ');

    if (!found && months.includes(dates[0])) {
      content += `\n${date}`;
      content += `\n${name}`;
      content += `\n${url}\n`;
    }
  }
  const urls = process.env.DISCORD_MAKMUR.split(',');
  await sendDiscordContents(content, urls);

  // update data
  if (env === 'production') {
    writeFile(fileData.makmur, items);
  }
};

module.exports = makmur;
