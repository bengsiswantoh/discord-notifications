require('dotenv').config();
const axios = require('axios');

const { sendContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await axios({ url: website.makmur.source });
    const { data } = response;
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
