require('dotenv').config();
const cheerio = require('cheerio');

const { sendContents, sendAlert } = require('../helper/discord');

const website = require('../config/website');

const getItems = async () => {
  let result;
  let error;

  try {
    const response = await fetch(website.makmur.source);
    const responseText = await response.text();

    result = [];

    const $ = cheerio.load(responseText);
    $('a').each((idx, el) => {
      const href = el.attribs.href;
      let name;

      if (href.includes('post')) {
        const element = $(el);
        const children = element.children('div');
        const childrenLength = children.length;

        let promo = false;

        if (childrenLength === 1) {
          promo = true;
          name = children.children('div[color=black]').html();
        }

        if (childrenLength === 2) {
          const type = children.children('div[color=primary]').html();
          name = element.children('div[color=black]').html();

          if (type === 'PROMO') {
            promo = true;
          }
        }

        if (promo) {
          result.push({ href: website.makmur.generate + href, name });
        }
      }
    });
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
