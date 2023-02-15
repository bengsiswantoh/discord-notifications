require('dotenv').config();
const fs = require('fs');
const { sendAlert } = require('./discord');

const readJSONFile = async (filename, defaultValue = {}) => {
  let result;
  let error;

  try {
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, JSON.stringify(defaultValue));
    }

    const rawData = fs.readFileSync(filename);
    result = JSON.parse(rawData);
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

const writeFile = async (filename, data, isJSON = true) => {
  let result;
  let error;

  try {
    data = isJSON ? JSON.stringify(data) : data;

    fs.writeFileSync(filename, data);
    result = filename;
  } catch (err) {
    error = await sendAlert(err);
  }

  return [result, error];
};

module.exports = { writeFile, readJSONFile };
