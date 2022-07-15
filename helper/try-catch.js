require("dotenv").config();

const { sendContents } = require("./discord");

const tryCatch = async (functionParam) => {
  const urls = process.env.DISCORD_ERROR.split(",");

  try {
    const data = await functionParam();
    return [data, null];
  } catch (error) {
    const message = `${functionParam.name}\n${error}`;
    console.log(message);
    await sendContents(message, urls);
    return [null, error];
  }
};

module.exports = tryCatch;
