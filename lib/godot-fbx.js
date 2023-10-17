require('dotenv').config();

const { writeFile, readJSONFile } = require('../helper/data');
const { formatDateWithGMT } = require('../helper/date-format');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const getLatestRelease = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.godotFBX.source);
    const data = await response.json();
    result = data[0];
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const godotFBX = async () => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const filename = fileData.godotFBX;

    const [data, dataError] = await readJSONFile(filename);
    const [latest, latestError] = await getLatestRelease();

    if (dataError || latestError) {
      return;
    }

    if (latest) {
      const { id, name, body, assets, published_at } = latest;

      if (id !== data.id) {
        // send content
        const published_date = formatDateWithGMT(published_at);
        const title = `FBX2glTF - ${name}`;
        const url = assets[0].browser_download_url;
        const content =
          title + '\n\n' + published_date + '\n\n' + body + '\n\n' + url;
        const urls = process.env.DISCORD_GODOT_FBX.split(',');
        await sendDiscordContents(content, urls);

        // update data
        data.id = id;
        if (env === 'production') {
          writeFile(filename, data);
        }
      }
    }
  } catch (err) {
    await sendAlert(err);
  }
};

module.exports = godotFBX;
