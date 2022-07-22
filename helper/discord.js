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
      try {
        await axios({
          url,
          method: "post",
          data: { content },
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
};

const sendAlert = async (error) => {
  const urls = process.env.DISCORD_ERROR.split(",");

  console.log(error);
  await sendContents(error.stack.toString(), urls);

  return error;
};

module.exports = {
  sendContents,
  sendAlert,
};
