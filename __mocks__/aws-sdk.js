/**
 * Modified from https://derikwhittaker.blog/2018/02/20/using-manual-mocks-to-test-the-aws-sdk-with-jest/
 */
const stubs = require('./aws-stubs')

const AWS = {}

const TYPE_OPEN = 'opens'
const TYPE_CLICK = 'clicks'
const TYPE_SUBSCRIPTION = 'subscriptions'
const TYPE_UNSUBSCRIPTION = 'unsubscriptions'

// This here is to allow/prevent runtime errors if you are using
// AWS.config to do some runtime configuration of the library.
AWS.config = {
  setPromisesDependency: (arg) => {},
  update: (arg) => {}
}

AWS.S3 = function () {

}

// Because I care about using the S3 service's which are part of the SDK
// I need to setup the correct identifier.
AWS.S3.prototype = {
  ...AWS.S3.prototype,

  // Stub for the listObjectsV2 method in the sdk
  listObjectsV2 (params) {
    // pulling in stub data from an external file to remove the noise from this file.
    let contents
    let fileType

    if (params['Prefix'].startsWith(TYPE_OPEN)) {
      fileType = TYPE_OPEN
    } else if (params['Prefix'].startsWith(TYPE_CLICK)) {
      fileType = TYPE_CLICK
    } else if (params['Prefix'].startsWith(TYPE_UNSUBSCRIPTION)) {
      fileType = TYPE_UNSUBSCRIPTION
    } else if (params['Prefix'].startsWith(TYPE_SUBSCRIPTION)) {
      fileType = TYPE_SUBSCRIPTION
    } else {
      throw new Error(`Type ${params['Prefix']} not supported.`)
    }

    let filteredData

    switch (fileType) {
      case TYPE_OPEN:
        contents = stubs.listOpens['Contents']
        filteredData = Object.create(stubs.listOpens)
        break
      case TYPE_CLICK:
        contents = stubs.listClicks['Contents']
        filteredData = Object.create(stubs.listClicks)
        break
      case TYPE_SUBSCRIPTION:
        contents = stubs.listSubscriptions['Contents']
        filteredData = Object.create(stubs.listSubscriptions)
        break
      case TYPE_UNSUBSCRIPTION:
        contents = stubs.listUnsubscriptions['Contents']
        filteredData = Object.create(stubs.listUnsubscriptions)
    }
    const filteredContents = []

    for (let i = 0; i < contents.length; i++) {
      if (`${fileType}/${contents[i]['Key']}`.startsWith(params['Prefix'])) {
        filteredContents.push(contents[i])
      }
    }

    filteredData['Contents'] = filteredContents
    return {
      promise: () => Promise.resolve(filteredData)
    }
  },

  getObject (params) {
    let zippedData

    if (params['Key'].indexOf('clicks') !== -1) {
      zippedData = stubs.getClicks
    } else if (params['Key'].indexOf('opens') !== -1) {
      zippedData = stubs.getOpens
    } else if (params['Key'].indexOf(TYPE_UNSUBSCRIPTION) !== -1) {
      zippedData = stubs.getUnsubscriptions
    } else if (params['Key'].indexOf(TYPE_SUBSCRIPTION) !== -1) {
      zippedData = stubs.getSubscriptions
    } else {
      zippedData = stubs.getOther(params['Key'])
      if (zippedData instanceof Error) {
        return { promise: () => Promise.reject(zippedData) }
      }
    }
    return {
      promise: () => Promise.resolve(zippedData)
    }
  }
}

// Export my AWS function so it can be referenced via requires
module.exports = AWS
