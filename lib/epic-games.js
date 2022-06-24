require("dotenv").config();
const axios = require("axios");

const fs = require("fs");

const writeData = require("../helper/write-data");
const { formatDateWithGMT } = require("../helper/date-format");
const { sendContents } = require("../helper/discord");

const website = require("../config/website");
const fileData = require("../config/file-data");

const getList = async () => {
  const response = await axios({ url: website.epicGames.source });
  const { data } = response;
  let elements = data.data.Catalog.searchStore.elements;

  elements = elements.filter(
    (item) => item.promotions && item.promotions.promotionalOffers.length > 0
  );
  elements = elements.map((item) => {
    const { productSlug, promotions } = item;
    const offer = promotions.promotionalOffers[0].promotionalOffers[0];
    const startDate = formatDateWithGMT(offer.startDate);
    const endDate = formatDateWithGMT(offer.endDate);

    let url;
    if (productSlug) {
      url = `${website.epicGames.generate}${productSlug}`;
    } else {
      if (item.offerMappings.length > 0) {
        url = `${website.epicGames.generate}${item.offerMappings[0].pageSlug}`;
      }
    }
    const result = { startDate, endDate, url };
    return result;
  });

  return elements;
};

const main = async () => {
  const env = process.env.NODE_ENV || "development";
  const rawData = fs.readFileSync(fileData.epicGames);
  const data = JSON.parse(rawData);

  const list = await getList();

  if (JSON.stringify(data) !== JSON.stringify(list)) {
    // update data
    if (env === "production") {
      writeData(fileData.epicGames, list);
    }

    // send content
    const urls = process.env.DISCORD_EPIC_GAMES.split(",");
    let content = "Limited Free Promotion:\n";
    for (const item of list) {
      const { startDate, endDate } = item;
      content += `\n${startDate} - ${endDate}\n${item.url}\n`;
    }
    await sendContents(content, urls);
  }
};

module.exports = main;
