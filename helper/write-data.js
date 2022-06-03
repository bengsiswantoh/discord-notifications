require("dotenv").config();
const fs = require("fs");

const main = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data));
};

module.exports = main;
