require('dotenv').config();
require('dayjs/locale/id');
const cheerio = require('cheerio');

const dayjs = require('dayjs');
dayjs.locale('id');

const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');

const getYesterday = () => {
  const formatDate = 'YYYY-MM-DDT:00:00:00';
  const now = dayjs();
  const yesterday = now.subtract(1, 'day').format(formatDate);

  return yesterday;
};

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.bareksa.source);
    const responseText = await response.text();
    const $ = cheerio.load(responseText);
    const scriptData = JSON.parse($('#__NEXT_DATA__').html());
    const data = scriptData.props.pageProps.news_data.list.data;

    const yesterday = getYesterday();

    result = data.filter((item) => item.publishedAt > yesterday);
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const bareksa = async () => {
  const env = process.env.NODE_ENV || 'development';

  const [items, itemsError] = await getItems();

  let content = '';
  for (const promo of items) {
    const { _id, title, subtitle, slug } = promo;

    const url =
      website.bareksa.source + `/${_id.slice(_id.length - 10)}/${slug}`;

    content += `\n${title}`;
    content += `\n${subtitle}`;
    content += `\n${url}\n`;
  }
  const urls = process.env.DISCORD_BAREKSA.split(',');
  await sendDiscordContents(content, urls);
};

module.exports = bareksa;
