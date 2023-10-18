require('dotenv').config();

const { writeFile, readJSONFile } = require('../helper/data');
const { formatDateWithGMT } = require('../helper/date-format');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.epicGames.source);
    const data = await response.json();
    let items = data.data.Catalog.searchStore.elements;

    items = items.filter(
      (item) =>
        item.promotions &&
        item.promotions.promotionalOffers.length > 0 &&
        item.price.totalPrice.discountPrice === 0
    );

    result = items;
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const processItem = (item) => {
  const { catalogNs, promotions, productSlug, offerMappings } = item;
  const offer = promotions.promotionalOffers[0].promotionalOffers[0];
  let slug = productSlug;

  if (catalogNs.mappings && catalogNs.mappings.length > 0) {
    slug = catalogNs.mappings[0].pageSlug;
  }
  if (offerMappings && offerMappings.length > 0) {
    slug = offerMappings[0].pageSlug;
  }

  const url = `${website.epicGames.generate}${slug}`;
  const startDate = formatDateWithGMT(offer.startDate);
  const endDate = formatDateWithGMT(offer.endDate);

  return { url, startDate, endDate };
};

const processItems = (items, data) => {
  const result = [];
  let content = '';

  for (const item of items) {
    const { url, startDate, endDate } = processItem(item);

    result.push({ startDate, endDate, url });

    const found = data.find((itemData) => itemData.url === url);
    if (!found) {
      content += `\n${startDate} - ${endDate}`;
      content += `\n${url}\n`;
    }
  }

  if (content.length > 0) {
    content = 'Limited Free Promotion:\n' + content;
  }

  return { content, result };
};

const epicGames = async () => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const filename = fileData.epicGames;

    const [data, dataError] = await readJSONFile(filename, []);
    const [items, itemsError] = await getItems();

    if (dataError || itemsError) {
      return;
    }

    const { content, result } = processItems(items, data);

    const urls = process.env.DISCORD_EPIC_GAMES.split(',');
    await sendDiscordContents(content, urls);

    // update data
    if (env === 'production') {
      writeFile(filename, result);
    }
  } catch (err) {
    await sendAlert(err);
  }
};

module.exports = epicGames;
