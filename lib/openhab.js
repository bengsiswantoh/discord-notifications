require('dotenv').config();

const { writeFile, readJSONFile } = require('../helper/data');
const { formatDateWithGMT } = require('../helper/date-format');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const getLatestRelease = async (url) => {
  let result;
  let error;

  try {
    const response = await fetch(url);
    const data = await response.json();
    result = data[0];
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const checkRelease = async (filename, url, appName) => {
  const env = process.env.NODE_ENV || 'development';

  const [data, dataError] = await readJSONFile(filename);

  const [latest, latestError] = await getLatestRelease(url);

  if (dataError || latestError) {
    return;
  }

  let { id, name, body, published_at } = latest;

  if (id !== data.id) {
    // send content
    const published_date = formatDateWithGMT(published_at);
    const title = `${appName} - ${name}`;
    const content = title + '\n\n' + published_date + '\n\n' + body;
    const urls = process.env.DISCORD_OPENHAB.split(',');
    await sendDiscordContents(content, urls);

    // update data
    data.id = id;
    if (env === 'production') {
      writeFile(filename, data);
    }
  }
};

const openhab = async () => {
  await checkRelease(
    fileData.openhabAndroid,
    website.openhabAndroid.source,
    'openhab-android'
  );

  await checkRelease(
    fileData.openhabDistro,
    website.openhabDistro.source,
    'openhab-distro'
  );
};

module.exports = openhab;
