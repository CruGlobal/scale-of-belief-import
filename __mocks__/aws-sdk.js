/**
 * Modified from https://derikwhittaker.blog/2018/02/20/using-manual-mocks-to-test-the-aws-sdk-with-jest/
 */
const stubs = require('./aws-stubs');

const AWS = {};

// This here is to allow/prevent runtime errors if you are using
// AWS.config to do some runtime configuration of the library.
AWS.config = {
  setPromisesDependency: (arg) => {},
  update: (arg) => {}
};

AWS.S3 = function() {

}

// Because I care about using the S3 service's which are part of the SDK
// I need to setup the correct identifier.
AWS.S3.prototype = {
  ...AWS.S3.prototype,

  // Stub for the listObjectsV2 method in the sdk
  listObjectsV2(params) {
    // pulling in stub data from an external file to remove the noise from this file.
    const contents = stubs.listObjects['Contents'];
    let filteredContents = [];

    for (let i = 0; i < contents.length; i++) {
      if (contents[i]['Key'].startsWith(params['Prefix'])) {
        filteredContents.push(contents[i]);
      }
    }

    let filteredData = Object.create(stubs.listObjects);
    filteredData['Contents'] = filteredContents;
    return {
      promise: () => Promise.resolve(filteredData)
    };
  },

  getObject(params) {
    let csvData;

    if (params['Key'].indexOf('clicks') !== -1) {
      csvData = stubs.getClicks;
    } else if (params['Key'].indexOf('opens') !== -1) {
      csvData = stubs.getOpens;
    } else {
      csvData = stubs.getOther(params['Key']);
    }
    return {
      promise: () => Promise.resolve(csvData)
    };
  }
};

// Export my AWS function so it can be referenced via requires
module.exports = AWS;