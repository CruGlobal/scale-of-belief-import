const AWS = require('aws-sdk');
const csvParse = require('csv-parse');
const snowplow = require('./snowplow');
const util = require('./util');
const redis = require('redis');
const moment = require('moment');
const {promisify} = require('util');
const zlib = require('zlib');

AWS.config.update({region: 'us-east-1'});
AWS.config.setPromisesDependency(null); // Use promises instead of callbacks
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const LAST_SUCCESS_KEY = 'scale-of-belief-import-campaign-last-success';
let redisClient;
let eventTracker;

let finishedOpens = 0;
let finishedClicks = 0;
let finishedSubs = 0;
let finishedUnsubs = 0;

let dayCount = 0;

const self = module.exports = {
  // -1 to differentiate between 0 result files
  totals: {
    numOpens: -1,
    numClicks: -1,
    numSubs: -1,
    numUnsubs: -1
  },
  /* istanbul ignore next */
  handler: (event, context, callback) => {
    /* istanbul ignore next */
    const handleCampaignData = async () => {
      try {
        self.setupHandlers();
        const getAsync = promisify(redisClient.get).bind(redisClient);

        let lastSuccessfulDate = await getAsync(LAST_SUCCESS_KEY);
        let today = new Date();

        let dateToProcess = moment(lastSuccessfulDate);
        let formattedDate;
        while (dateToProcess.startOf('day') < moment(today).startOf('day')) {
          dateToProcess = dateToProcess.add(1, 'days');
          formattedDate = util.buildFormattedDate(new Date(dateToProcess.valueOf()));

          await self.advanceCounter('numOpens', formattedDate, 'opens');
          await self.advanceCounter('numClicks', formattedDate, 'clicks');
          await self.advanceCounter('numSubs', formattedDate, 'subscriptions');
          await self.advanceCounter('numUnsubs', formattedDate, 'unsubscriptions');
          dayCount++;
        }
      } catch (error) {
        throw new Error(error);
      }
    };

    let timer;

    /* istanbul ignore next */
    handleCampaignData().then(() => {
      // Constantly check for more events until they're all done
      timer = setInterval(self.eventsHaveFinished, 3000);

      eventTracker.on('end', () => {
        if (timer) {
          clearInterval(timer);
        }
        console.log(`Ran ${dayCount} day(s) of data.`);
        console.log(`Ran ${finishedOpens} of ${self.totals.numOpens} open-email records.`);
        console.log(`Ran ${finishedClicks} of ${self.totals.numClicks} click-link records.`);
        console.log(`Ran ${finishedSubs} of ${self.totals.numSubs} subscribe records.`);
        console.log(`Ran ${finishedUnsubs} of ${self.totals.numUnsubs} unsubscribe records.`);

        self.updateLastSuccess().then(() => {
          redisClient.quit();
          callback(null, { statusCode: 204 });
        }).catch((err) => {
          redisClient.quit();
          callback(err);
        })

      })
    }).catch((error) => {
      if (redisClient) {
        redisClient.quit();
      }
      callback('Failed to send campaign data to snowplow: ' + error);
    });
  },
  advanceCounter: async (counterKey, formattedDate, type) => {
    if (self.totals[counterKey] === -1) {
      self.totals[counterKey] = await self.trackEvents(formattedDate, type);
    } else {
      self.totals[counterKey] += await self.trackEvents(formattedDate, type);
    }
  },
  trackEvents: async (formattedDate, type) => {
    let fileName = await self.determineFileName(type, formattedDate);
    if (fileName) {
      let csvData = await self.getDataFromS3(fileName);
      let parsedData = await self.parseDataFromCsv(csvData);
      await self.sendEventsToSnowplow(parsedData, type);
      return parsedData.length;
    } else {
      console.log(`File name based on ${type} ${formattedDate} not found.`);
    }
    return 0;
  },
  determineFileName: (type, formattedDate) => {
    const params = {
      Bucket: process.env.CAMPAIGN_SNOWPLOW_S3_BUCKET,
      Prefix: `${type}/${type}_${formattedDate}`
    };

    return s3.listObjectsV2(params).promise().then((data) => {
      const files = data['Contents'];
      let latestModified = null;
      let latestFileName = null;

      for (let i = 0; i < files.length; i++) {
        let fileData = files[i];
        let lastModified = fileData['LastModified'];
        let fileName = fileData['Key'];

        if (latestModified === null || lastModified > latestModified) {
          latestModified = lastModified;
          latestFileName = fileName;
        }
      }
      return latestFileName;
    });
  },
  getDataFromS3: (fileName) => {
    const params = {
      Bucket: process.env.CAMPAIGN_SNOWPLOW_S3_BUCKET,
      Key: fileName
    };

    return s3.getObject(params).promise().then((data) => {
      return zlib.unzipSync(data['Body']);
    }).catch((error) => {
      if (error.message === 'The specified key does not exist.') {
        // If there is no file for this, just return an empty buffer
        return Buffer.from('');
      } else {
        throw error;
      }
    });
  },
  parseDataFromCsv: (csvData) => {
    return new Promise((resolve, reject) => {
      csvParse(csvData, { columns: true, trim: true }, (error, output) => {
        if (error) {
          reject(error);
        }
        resolve(output);
      });
    });
  },
  sendEventsToSnowplow: (data, type) => {
    for (let i = 0; i < data.length; i++) {
      snowplow.trackEvent(data[i], type);
    }
    snowplow.flush();
  },
  updateLastSuccess: () => {
    return new Promise((resolve, reject) => {
      redisClient.set(LAST_SUCCESS_KEY, new Date(Date.now()).toISOString(), (error, response) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  },
  eventsHaveFinished: () => {
    if (dayCount === 0) {
      eventTracker.emit('end');
      return;
    }

    if (self.totals.numOpens === -1
      || self.totals.numClicks === -1
      || self.totals.numSubs === -1
      || self.totals.numUnsubs === -1) {
      console.log('Something is still -1');
      return;
    }

    if (finishedOpens >= self.totals.numOpens
      && finishedClicks >= self.totals.numClicks
      && finishedSubs >= self.totals.numSubs
      && finishedUnsubs >= self.totals.numUnsubs) {
      eventTracker.emit('end');
    }
  },
  setupHandlers: () => {
    redisClient = redis.createClient(process.env.REDIS_PORT_6379_TCP_ADDR_PORT, process.env.REDIS_PORT_6379_TCP_ADDR);
    redisClient.on('error', (error) => {
      throw new Error('Error connecting to Redis: ' + error);
    });

    eventTracker = snowplow.getSnowplowEventTracker();
    eventTracker.on('ping', (eventType, numProcessed) => {
      switch (eventType) {
        case 'open-email':
          finishedOpens = finishedOpens + numProcessed;
          break;
        case 'click-link':
          finishedClicks = finishedClicks + numProcessed;
          break;
        case 'subscribe':
          finishedSubs = finishedSubs + numProcessed;
          break;
        case 'unsubscribe':
          finishedUnsubs = finishedUnsubs + numProcessed;
          break;
      }
    });
  },

  // For testing only
  setDataToProcess(_dayCount, _numOpens, _numClicks, _numSubs, _numUnsubs) {
    dayCount = _dayCount || 0;
    self.totals.numOpens = _numOpens || -1;
    self.totals.numClicks = _numClicks || -1;
    self.totals.numSubs = _numSubs || -1;
    self.totals.numUnsubs = _numUnsubs || -1;
  }
};
