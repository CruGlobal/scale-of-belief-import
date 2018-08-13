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

const self = module.exports = {
  /* istanbul ignore next */
  handler: (event, context, callback) => {
    /* istanbul ignore next */
    const handleCampaignData = async () => {
      try {
        redisClient = redis.createClient(process.env.REDIS_PORT_6379_TCP_ADDR_PORT, process.env.REDIS_PORT_6379_TCP_ADDR);
        const getAsync = promisify(redisClient.get).bind(redisClient);

        redisClient.on('error', (error) => {
          throw new Error('Error connecting to Redis: ' + error);
        });

        let lastSuccessfulDate = await getAsync(LAST_SUCCESS_KEY);
        let today = new Date();
        let count = 0;

        let dateToProcess = moment(lastSuccessfulDate);
        let formattedDate;
        while (dateToProcess.startOf('day') < moment(today).startOf('day')) {
          dateToProcess = dateToProcess.add(1, 'days');
          formattedDate = util.buildFormattedDate(new Date(dateToProcess.valueOf()));

          await self.trackEvents(formattedDate, 'opens');
          await self.trackEvents(formattedDate, 'clicks');
          count++;
        }

        console.log(`Ran ${count} day(s) of data.`);
        await self.updateLastSuccess();
      } catch (error) {
        throw new Error(error);
      }
    };

    /* istanbul ignore next */
    handleCampaignData().then(() => {
      redisClient.quit();
      callback(null, { statusCode: 204 });
    }).catch((error) => {
      if (redisClient) {
        redisClient.quit();
      }
      callback('Failed to send campaign data to snowplow: ' + error);
    });
  },
  trackEvents: async (formattedDate, type) => {
    let fileName = await self.determineFileName(type, formattedDate);
    if (fileName) {
      let csvData = await self.getDataFromS3(fileName);
      let parsedData = await self.parseDataFromCsv(csvData);
      await self.sendEventsToSnowplow(parsedData, type);
    }
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
      redisClient.set(LAST_SUCCESS_KEY, new Date(Date.now()).toISOString());
      resolve();
    });
  }
};