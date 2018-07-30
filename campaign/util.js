const buildFormattedDate = (date) => {
  return date.getUTCFullYear() +
    getZeroPaddedValue(date.getUTCMonth() + 1) +
    getZeroPaddedValue(date.getUTCDate());
};

const getZeroPaddedValue = (original) => {
  return ('0' + original).slice(-2);
};

module.exports = {
  buildFormattedDate: buildFormattedDate
};