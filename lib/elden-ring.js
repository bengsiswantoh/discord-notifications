require("dotenv").config();
const axios = require("axios");

const fs = require("fs");

const writeData = require("../helper/write-data");
const { formatDateWithGMT } = require("../helper/date-format");
const { sendContents } = require("../helper/discord");

const website = require("../config/website");
const fileData = require("../config/file-data");

const getLatestRelease = async () => {
  const response = await axios({ url: website.eldenRing.source });
  return response.data[0];
};

const eldenRing = async () => {
  const env = process.env.NODE_ENV || "development";
  const rawData = fs.readFileSync(fileData.eldenRing);
  const data = JSON.parse(rawData);

  const latest = await getLatestRelease();
  const { id, name, body, assets, published_at } = latest;

  if (id !== data.id) {
    // update data
    data.id = id;
    if (env === "production") {
      writeData(fileData.eldenRing, data);
    }

    // send content
    const published_date = formatDateWithGMT(published_at);
    const title = `LukeYui/EldenRingSeamlessCoopRelease - ${name}`;
    const url = assets[0].browser_download_url;
    const content =
      title + "\n\n" + published_date + "\n\n" + body + "\n\n" + url;
    const urls = process.env.DISCORD_ELDEN_RING.split(",");
    await sendContents(content, urls);
  }
};

module.exports = eldenRing;
