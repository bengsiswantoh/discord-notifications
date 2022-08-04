require("dotenv").config();
const axios = require("axios");

const { writeFile, readJSONFile } = require("../helper/data");
const { formatDateWithGMT } = require("../helper/date-format");
const { sendContents, sendAlert } = require("../helper/discord");

const website = require("../config/website");
const fileData = require("../config/file-data");

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await axios({ url: website.epicGames.source });
    const { data } = response;
    let items = data.data.Catalog.searchStore.elements;

    items = items.filter(
      (item) =>
        item.promotions &&
        item.promotions.promotionalOffers.length > 0 &&
        item.price.totalPrice.discountPrice === 0
    );
    items = items.map((item) => {
      const { catalogNs, promotions } = item;
      const offer = promotions.promotionalOffers[0].promotionalOffers[0];
      const startDate = formatDateWithGMT(offer.startDate);
      const endDate = formatDateWithGMT(offer.endDate);

      const url = `${website.epicGames.generate}${catalogNs.mappings[0].pageSlug}`;
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
  const env = process.env.NODE_ENV || "development";

  const [data, dataError] = await readJSONFile(fileData.epicGames, []);
  const [items, itemsError] = await getItems();

  if (dataError || itemsError) {
    return;
  }

  if (JSON.stringify(data) !== JSON.stringify(items)) {
    // send notification
    let content = "Limited Free Promotion:\n";
    for (const item of items) {
      const { startDate, endDate } = item;
      content += `\n${startDate} - ${endDate}\n${item.url}\n`;
    }
    const urls = process.env.DISCORD_EPIC_GAMES.split(",");
    await sendContents(content, urls);

    // update data
    if (env === "production") {
      writeFile(fileData.epicGames, items);
    }
  }
};

module.exports = epicGames;
