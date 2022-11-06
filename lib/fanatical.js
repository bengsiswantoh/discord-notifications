require('dotenv').config();

const website = require('../config/website');

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.fanatical.source);
    const data = await response.json();

    result = data.map((item) => {
      const { slug } = item;

      return { url: `${website.fanatical.generate}${slug}` };
    });
    console.log(result);
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const fanatical = async () => {
  // console.log(website);
  const env = process.env.NODE_ENV || 'development';

  // const [data, dataError] = await readJSONFile(fileData.epicGames, []);
  const [items, itemsError] = await getItems();

  // update data
  if (env === 'production') {
    // writeFile(fileData.fanatical, items);
  }
};

module.exports = fanatical;
