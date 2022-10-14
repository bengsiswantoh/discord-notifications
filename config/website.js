module.exports = {
  eldenRing: {
    source:
      'https://api.github.com/repos/LukeYui/EldenRingSeamlessCoopRelease/releases',
  },
  openhabAndroid: {
    source: 'https://api.github.com/repos/openhab/openhab-android/releases',
  },
  epicGames: {
    source:
      'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=ID&allowCountries=ID',
    generate: 'https://store.epicgames.com/en-US/p/',
  },
  humbleBundle: {
    source: 'https://www.humblebundle.com/bundles',
    generateStart: 'https://www.humblebundle.com',
    generateEnd: '?partner=bengsiswantoh',
  },
  fanatical: {
    source: 'https://www.fanatical.com/api/algolia/bundles?altRank=false',
    generate: 'https://www.fanatical.com/en/bundle/',
  },
  makmur: {
    source:
      'https://api.makmur.id/graphql/blogs/public?query={blogPosts(featured:true){_id,url,title,image,publishedAt,blogCategory{name,code,}}}',
  },
};
