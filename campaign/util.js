const {isEqual} = require('lodash');

const buildFormattedDate = (date) => {
  return date.getUTCFullYear() +
    getZeroPaddedValue(date.getUTCMonth() + 1) +
    getZeroPaddedValue(date.getUTCDate());
};

const getZeroPaddedValue = (original) => {
  return ('0' + original).slice(-2);
};

// Modified from https://stackoverflow.com/a/34890276
const groupBy = (values, key) => {
  return values.reduce((previousValue, currentValue) => {
    (previousValue[currentValue[key]] = previousValue[currentValue[key]] || []).push(currentValue);
    return previousValue;
  }, {});
};

const containsObject = (collection, objectToFind) => {
  for (let i in collection) {
    if (isEqual(objectToFind, collection[i])) {
      return true;
    }
  }
  return false;
};

module.exports = {
  buildFormattedDate: buildFormattedDate,
  groupBy: groupBy,
  containsObject: containsObject
};