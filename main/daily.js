require("dotenv").config();

const { sendContents } = require("../helper/discord");

const eldenRing = require("../lib/elden-ring");
const epicGames = require("../lib/epic-games");

const main = async () => {
  const urls = process.env.DISCORD_ERROR.split(",");

  try {
    await eldenRing();
  } catch (err) {
    console.log(err);
    sendContents("elden ring error\n" + err.message, urls);
  }

  try {
    await epicGames();
  } catch (err) {
    console.log(err);
    sendContents("epic games error\n" + err.message, urls);
  }
};

main();
