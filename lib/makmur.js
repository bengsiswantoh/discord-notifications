require('dotenv').config();

const { sendContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.makmur.source);
    const data = await response.json();
    console.log(data);

    const result = [];

    // result = data.map((item) => {
    //   const { slug } = item;

    //   return { url: `${website.makmur.generate}${slug}` };
    // });
    // console.log(result);
  } catch (err) {
    // error = await sendAlert(err);
    console.log(err);
  }

  return [result, error];
};

const makmur = async () => {
  // console.log(website);
  const env = process.env.NODE_ENV || 'development';

  // const [data, dataError] = await readJSONFile(fileData.epicGames, []);
  const [items, itemsError] = await getItems();

  // update data
  if (env === 'production') {
    // writeFile(fileData.makmur, items);
  }
};

module.exports = makmur;
