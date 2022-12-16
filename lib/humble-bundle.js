require('dotenv').config();
const cheerio = require('cheerio');
const TurndownService = require('turndown');

const { writeFile, readJSONFile } = require('../helper/data');
const { formatDateWithGMT } = require('../helper/date-format');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.humbleBundle.source);
    const responseText = await response.text();

    const $ = cheerio.load(responseText);
    const scriptData = JSON.parse($('#landingPage-json-data').html());
    const data = scriptData.data;

    const types = Object.keys(data);
    const bundles = [];
    for (const type of types) {
      for (const product of data[type].mosaic[0].products) {
        const {
          product_url,
          marketing_blurb,
          detailed_marketing_blurb,
          short_marketing_blurb,
        } = product;

        const startDate = formatDateWithGMT(product['start_date|datetime']);
        const endDate = formatDateWithGMT(product['end_date|datetime']);
        const url = `${website.humbleBundle.generateStart}${product_url}${website.humbleBundle.generateEnd}`;

        const turndownService = new TurndownService();
        const marketing = turndownService.turndown(marketing_blurb);

        const bundle = {
          startDate,
          endDate,
          url,
          marketing,
        };
        bundles.push(bundle);
      }
    }

    result = bundles;
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const humbleBundle = async () => {
  const env = process.env.NODE_ENV || 'development';

  const [data, dataError] = await readJSONFile(fileData.humbleBundle, []);
  const [items, itemsError] = await getItems();

  if (dataError || itemsError) {
    return;
  }

  let content = '';
  for (const bundle of items) {
    const { url, startDate, endDate, marketing } = bundle;
    const found = data.find((item) => item.url === url);
    if (!found) {
      content += `\n${startDate} - ${endDate}`;
      content += `\n${marketing}`;
      content += `\n${url}\n`;
    }
  }
  const urls = process.env.DISCORD_HUMBLE_BUNDLE.split(',');
  await sendDiscordContents(content, urls);

  // update data
  if (env === 'production') {
    writeFile(fileData.humbleBundle, items);
  }
};

module.exports = humbleBundle;
