require("dotenv").config();
const axios = require("axios");

const sendContents = async (content, urls) => {
  const env = process.env.NODE_ENV || "development";

  if (env === "development") {
    console.log("urls", urls);
    console.log("content");
    console.log(content);
  } else {
    for (const url of urls) {
      await axios({
        url,
        method: "post",
        data: { content },
      });
    }
  }
};

module.exports = {
  sendContents,
};
