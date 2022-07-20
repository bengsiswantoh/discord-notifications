require("dotenv").config();
const axios = require("axios");

const fs = require("fs");

const writeData = require("../helper/write-data");
const { formatDateWithGMT } = require("../helper/date-format");
const { sendContents } = require("../helper/discord");

const website = require("../config/website");
const fileData = require("../config/file-data");

const getItems = async () => {
  const response = await axios({ url: website.epicGames.source });
  const { data } = response;
  let elements = data.data.Catalog.searchStore.elements;

  elements = elements.filter(
    (item) =>
      item.promotions &&
      item.promotions.promotionalOffers.length > 0 &&
      item.price.totalPrice.discountPrice === 0
  );
  elements = elements.map((item) => {
    const { catalogNs, promotions } = item;
    const offer = promotions.promotionalOffers[0].promotionalOffers[0];
    const startDate = formatDateWithGMT(offer.startDate);
    const endDate = formatDateWithGMT(offer.endDate);

    const url = `${website.epicGames.generate}${catalogNs.mappings[0].pageSlug}`;
    const result = { startDate, endDate, url };
    return result;
  });

  return elements;
};

const claimGames = async (items) => {};

const epicGames = async () => {
  const env = process.env.NODE_ENV || "development";
  const rawData = fs.readFileSync(fileData.epicGames);
  const data = JSON.parse(rawData);

  const items = await getItems();

  if (JSON.stringify(data) !== JSON.stringify(list)) {
    // send notification
    let content = "Limited Free Promotion:\n";
    for (const item of items) {
      const { startDate, endDate } = item;
      content += `\n${startDate} - ${endDate}\n${item.url}\n`;
    }
    const urls = process.env.DISCORD_EPIC_GAMES.split(",");
    await sendContents(content, urls);

    // claim games
    await claimGames(items);

    // update data
    if (env === "production") {
      writeData(fileData.epicGames, items);
    }
  }
};

module.exports = epicGames;
