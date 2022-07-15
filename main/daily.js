const eldenRing = require("../lib/elden-ring");
const epicGames = require("../lib/epic-games");
const tryCatch = require("../helper/try-catch");

const main = async () => {
  await tryCatch(eldenRing);
  await tryCatch(epicGames);
};

main();
