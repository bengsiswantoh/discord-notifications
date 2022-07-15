require("dotenv").config();

const { sendContents } = require("./discord");

const tryCatch = async (functionParam) => {
  const urls = process.env.DISCORD_ERROR.split(",");

  try {
    const data = await functionParam();
    return [data, null];
  } catch (error) {
    console.log(`${functionParam.name}\n${error}`);

    const message = `${functionParam.name}\n${error.toString()}`;
    await sendContents(message, urls);
    return [null, error];
  }
};

module.exports = tryCatch;
