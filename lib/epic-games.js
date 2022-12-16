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
    items = items.map((item) => {
      const { catalogNs, promotions, productSlug, offerMappings } = item;

      const offer = promotions.promotionalOffers[0].promotionalOffers[0];
      const startDate = formatDateWithGMT(offer.startDate);
      const endDate = formatDateWithGMT(offer.endDate);

      let slug = productSlug;
      if (catalogNs.mappings.length > 0) {
        slug = catalogNs.mappings[0].pageSlug;
      }
      if (offerMappings.length > 0) {
        slug = offerMappings[0].pageSlug;
      }
      const url = `${website.epicGames.generate}${slug}`;

      const result = { startDate, endDate, url };
      return result;
    });

    result = items;
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const epicGames = async () => {
  const env = process.env.NODE_ENV || 'development';

  const [data, dataError] = await readJSONFile(fileData.epicGames, []);
  const [items, itemsError] = await getItems();

  if (dataError || itemsError) {
    return;
  }

  let content = '';
  for (const item of items) {
    const { url, startDate, endDate } = item;
    const found = data.find((item) => item.url === url);
    if (!found) {
      content += `\n${startDate} - ${endDate}`;
      content += `\n${url}\n`;
    }
  }
  const urls = process.env.DISCORD_EPIC_GAMES.split(',');
  if (content.length > 0) {
    content = 'Limited Free Promotion:\n' + content;
  }
  await sendDiscordContents(content, urls);

  // update data
  if (env === 'production') {
    writeFile(fileData.epicGames, items);
  }
};

module.exports = epicGames;
