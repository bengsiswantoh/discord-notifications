const axios = require("axios");

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
  if (content.length === 0) {
    return;
  }

  if (debug) {
    console.log("===");
    console.log(content);
  } else {
    for (const discordURL of discordURLs) {
      const response = await axios({
        method: "post",
        url: discordURL,
        data: {
          content,
        },
      });
    }
  }
};

const getLatestRelease = async () => {
  const response = await axios({ url: githubURL });
  return response.data[0];
};

const main = async () => {
  const releases = await getLatestRelease();
  const { id, name, body, assets, created_at } = releases;

  if (id !== dataFile.id) {
    dataFile.id = id;
    fs.writeFileSync(dataFilename, JSON.stringify(dataFile));

    let content = `New release: ${name} (${created_at})\n${body}\n${assets[0].browser_download_url}`;
    await sendMessage(content);
  }
};

main();
