require('dotenv').config();

const { writeFile, readJSONFile } = require('../helper/data');
const { formatDateWithGMT } = require('../helper/date-format');
const { sendDiscordContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');
const fileData = require('../config/file-data');

const items = [
  {
    file: fileData.openhabAndroid,
    website: website.openhabAndroid.source,
    appName: 'openhab-android',
    urls: process.env.DISCORD_OPENHAB,
  },
  {
    file: fileData.openhabDistro,
    website: website.openhabDistro.source,
    appName: 'openhab-distro',
    urls: process.env.DISCORD_OPENHAB,
  },
];

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

const checkRelease = async (filename, url, appName, urls) => {
  const env = process.env.NODE_ENV || 'development';

  const [data, dataError] = await readJSONFile(filename);

  const [latest, latestError] = await getLatestRelease(url);

  if (dataError || latestError) {
    return;
  }

  if (latest) {
    let { id, name, body, published_at } = latest;

    if (id !== data.id) {
      // send content
      const published_date = formatDateWithGMT(published_at);
      const title = `${appName} - ${name}`;
      const content = title + '\n\n' + published_date + '\n\n' + body;

      urls = urls.split(',');
      await sendDiscordContents(content, urls);

      // update data
      data.id = id;
      if (env === 'production') {
        writeFile(filename, data);
      }
    }
  }
};

const openhab = async () => {
  for (const item of items) {
    const { file, website, appName, urls } = item;
    await checkRelease(file, website, appName, urls);
  }
};

module.exports = openhab;
