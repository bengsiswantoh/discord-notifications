require('dotenv').config();
require('dayjs/locale/id');
const cheerio = require('cheerio');

const dayjs = require('dayjs');
dayjs.locale('id');

const { writeFile, readJSONFile } = require('../helper/data');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const getYesterday = () => {
  const formatDate = 'YYYY-MM-DDT:00:00:00';
  const now = dayjs();
  const yesterday = now.subtract(10, 'day').format(formatDate);

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

const processItems = (items, data) => {
  const result = [];
  let content = '';

  for (const item of items) {
    const { _id, title, subtitle, slug } = item;

    const url =
      website.bareksa.source + `/${_id.slice(_id.length - 10)}/${slug}`;

    result.push({ _id, url, title, subtitle });

    const found = data.find((itemData) => itemData._id === _id);
    if (!found) {
      content += `\n${title}`;
      content += `\n${subtitle}`;
      content += `\n${url}\n`;
    }
  }

  return { content, result };
};

const bareksa = async () => {
  const env = process.env.NODE_ENV || 'development';

  const [data, dataError] = await readJSONFile(fileData.bareksa, []);
  const [items, itemsError] = await getItems();

  const { content, result } = processItems(items, data);
  const urls = process.env.DISCORD_BAREKSA.split(',');
  await sendDiscordContents(content, urls);

  // update data
  if (env === 'production') {
    writeFile(fileData.bareksa, result);
  }
};

module.exports = bareksa;
