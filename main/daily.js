const eldenRing = require('../lib/elden-ring');
const epicGames = require('../lib/epic-games');
const humbleBundle = require('../lib/humble-bundle');
const makmur = require('../lib/makmur');
const openhab = require('../lib/openhab');

const main = async () => {
  eldenRing();
  epicGames();
  humbleBundle();
  makmur();
  openhab();
};

main();
