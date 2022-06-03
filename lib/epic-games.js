require("dotenv").config();
const axios = require("axios");
const dayjs = require("dayjs");

const fs = require("fs");

const writeData = require("../helper/write-data");
const { sendContents } = require("../helper/discord");

const website = require("../config/website");
const dateFormat = require("../config/date-format");
const fileData = require("../config/file-data");

const getList = async () => {
  const response = await axios({ url: website.epicGames.source });
  const { data } = response;
  let elements = data.data.Catalog.searchStore.elements;

  elements = elements.filter((item) => item.productSlug !== "[]");
  elements = elements.map((item) => {
    const { productSlug, promotions } = item;
    const offer = promotions.promotionalOffers[0].promotionalOffers[0];
    const startDate = dayjs(offer.startDate).format(dateFormat.displayWithGMT);
    const endDate = dayjs(offer.endDate).format(dateFormat.displayWithGMT);
    const url = `${website.epicGames.generate}${productSlug}`;
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
