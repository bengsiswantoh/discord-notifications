const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone'); // dependent on utc plugin

dayjs.extend(utc);
dayjs.extend(timezone);

const dateFormat = require('../config/date-format');

const formatDateWithGMT = (value) =>
  dayjs(value).tz(dateFormat.timezone).format(dateFormat.displayWithGMT);

const unixTimestamp = (value) => dayjs(value).unix();

module.exports = {
  formatDateWithGMT,
  unixTimestamp,
};
