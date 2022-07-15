require("dotenv").config();
const fs = require("fs");

const writeData = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data));
};

module.exports = writeData;
