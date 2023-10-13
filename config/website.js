module.exports = {
  bareksa: { source: 'https://www.bareksa.com/berita/promo' },
  eldenRing: {
    source:
      'https://api.github.com/repos/LukeYui/EldenRingSeamlessCoopRelease/releases',
  },
  epicGames: {
    source:
      'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=ID&allowCountries=ID',
    generate: 'https://store.epicgames.com/en-US/p/',
  },
  fanatical: {
    source: 'https://www.fanatical.com/api/algolia/bundles?altRank=false',
    generate: 'https://www.fanatical.com/en/bundle/',
  },
  godotFBX: {
    source: 'https://api.github.com/repos/godotengine/FBX2glTF/releases',
  },
  humbleBundle: {
    source: 'https://www.humblebundle.com/bundles',
    generateStart: 'https://www.humblebundle.com',
    generateEnd: '?partner=bengsiswantoh',
  },
  makmur: {
    source: 'https://blog.makmur.id/category/promo/',
    generate: 'https://blog.makmur.id',
  },
  openhabAndroid: {
    source: 'https://api.github.com/repos/openhab/openhab-android/releases',
  },
  openhabDistro: {
    source: 'https://api.github.com/repos/openhab/openhab-distro/releases',
  },
};
