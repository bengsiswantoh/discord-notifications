const axios = require("axios");
const dayjs = require("dayjs");

const debug = false;
const githubURL =
  "https://api.github.com/repos/LukeYui/EldenRingSeamlessCoopRelease/releases";

const discordURLs = [];
for (let i = 2; i < process.argv.length; i++) {
  discordURLs.push(process.argv[i]);
}

const fs = require("fs");
const dataFilename = "data.json";
let rawData = fs.readFileSync(dataFilename);
let dataFile = JSON.parse(rawData);

const sendMessage = async (content) => {
  if (debug) {
    console.log("content");
    console.log(content);
  } else {
    for (const discordURL of discordURLs) {
      await axios({
        method: "post",
        url: discordURL,
        data: { content },
      });
    }
  }
};

const getLatestRelease = async () => {
  const response = await axios({ url: githubURL });
  return response.data[0];
};

const main = async () => {
  const latest = await getLatestRelease();
  const { id, name, body, assets, published_at } = latest;

  if (id !== dataFile.id) {
    dataFile.id = id;
    fs.writeFileSync(dataFilename, JSON.stringify(dataFile));

    const published_date = dayjs(published_at).format(
      "DD MMM YYYY HH:mm:ss ([GMT]ZZ)"
    );
    const title = `LukeYui/EldenRingSeamlessCoopRelease - ${name} - ${published_date}`;
    const url = assets[0].browser_download_url;
    const content = title + "\n" + body + "\n" + url;
    await sendMessage(content);
  }
};

main();
