const eldenRing = require('../lib/elden-ring');
const epicGames = require('../lib/epic-games');
const godotFBX = require('../lib/godot-fbx');
const humbleBundle = require('../lib/humble-bundle');
const makmur = require('../lib/makmur');
const openhab = require('../lib/openhab');

const main = async () => {
  eldenRing();
  epicGames();
  humbleBundle();
  godotFBX();
  makmur();
  openhab();
};

main();
