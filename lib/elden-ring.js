require('dotenv').config();

const { writeFile, readJSONFile } = require('../helper/data');
const { formatDateWithGMT } = require('../helper/date-format');
const { sendContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const getLatestRelease = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.eldenRing.source);
    const data = await response.json();
    result = data[0];
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const eldenRing = async () => {
  const env = process.env.NODE_ENV || 'development';
  const [data, dataError] = await readJSONFile(fileData.eldenRing);

  const [latest, latestError] = await getLatestRelease();

  if (dataError || latestError) {
    return;
  }

  const { id, name, body, assets, published_at } = latest;

  if (id !== data.id) {
    // send content
    const published_date = formatDateWithGMT(published_at);
    const title = `LukeYui/EldenRingSeamlessCoopRelease - ${name}`;
    const url = assets[0].browser_download_url;
    const content =
      title + '\n\n' + published_date + '\n\n' + body + '\n\n' + url;
    const urls = process.env.DISCORD_ELDEN_RING.split(',');
    await sendContents(content, urls);

    // update data
    data.id = id;
    if (env === 'production') {
      writeFile(fileData.eldenRing, data);
    }
  }
};

module.exports = eldenRing;
