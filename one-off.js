/**
 * This is a sample script file with various functionalities. To use one of them, uncomment the call
 * to the function you want to use. Also, make sure to put the right value into REDIS_PORT_6379_TCP_ADDR.
 */
const AWS = require('aws-sdk');
const csvParse = require('csv-parse');
const snowplow = require('./campaign/snowplow');
const util = require('./campaign/util');
const dataImport = require('./campaign/import');
const redis = require('redis');
const {promisify} = require('util');

AWS.config.update({region: 'us-east-1'});
AWS.config.setPromisesDependency(null); // Use promises instead of callbacks
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

process.env.DEBUG = '*';
process.env.CAMPAIGN_SNOWPLOW_S3_BUCKET = 'scale-of-belief-adobe-campaign';
process.env.REDIS_PORT_6379_TCP_ADDR_PORT = '6379';
process.env.REDIS_PORT_6379_TCP_ADDR = 'removed';

const runProcess = () => {
  const start = Date.now();
  dataImport.handler(null, null, (message, response) => {
    if (message) {
      console.log('Message:', message);
    }
    if (response) {
      console.log('Response:', JSON.stringify(response));
      console.log('Time taken:', Date.now() - start);
    }
  });
};

const LAST_SUCCESS_KEY = 'scale-of-belief-import-campaign-last-success';

const setRedisDate = async () => {
  const redisClient = redis.createClient(process.env.REDIS_PORT_6379_TCP_ADDR_PORT, process.env.REDIS_PORT_6379_TCP_ADDR);
  try {
//    let yesterday = new Date();
    let now = new Date(Date.now());
//    yesterday.setDate(yesterday.getDate() - 1);
    redisClient.set(LAST_SUCCESS_KEY, now.toISOString(), (error, response) => {
//    redisClient.set(LAST_SUCCESS_KEY, '2019-02-22 06:05:00.000Z', (error, response) => {
      if (error) {
        throw new Error(error);
      }
      getRedisDate();
    });
  } catch (error) {
    console.log(error);
  } finally {
    redisClient.quit();
  }
};

const getRedisDate = async () => {
  redisClient = redis.createClient(process.env.REDIS_PORT_6379_TCP_ADDR_PORT, process.env.REDIS_PORT_6379_TCP_ADDR);
  const getAsync = promisify(redisClient.get).bind(redisClient);
  try {
    let response = await getAsync(LAST_SUCCESS_KEY);
    console.log('Redis Date:', response);
    console.log('Redis Addr:', process.env.REDIS_PORT_6379_TCP_ADDR);

    redisClient.on('connect', () => {
      console.log('Redis connected')
    });
    redisClient.on('error', (error) => {
      throw new Error('Error connecting to Redis: ' + error);
    });
  } catch (error) {
    console.log(error);
  } finally {
    redisClient.quit();
  }
};

const oneOffProcess = async () => {
  fileSuffix = '20200711_010045';
  console.log(`${Date.now()} Running with suffix ${fileSuffix}`);
  let csvData;

//  csvData = await dataImport.getDataFromS3(`opens/opens_${fileSuffix}.csv.gz`);
//  let openData = await dataImport.parseDataFromCsv(csvData);
//  await dataImport.sendEventsToSnowplow(openData, 'opens');
//
//  csvData = await dataImport.getDataFromS3(`clicks/clicks_${fileSuffix}.csv.gz`);
//  let clickData = await dataImport.parseDataFromCsv(csvData);
//  await dataImport.sendEventsToSnowplow(clickData, 'clicks');
//  await setRedisDate();

 csvData = await dataImport.getDataFromS3(`subscriptions/subscriptions_${fileSuffix}.csv.gz`);
 let subscriptionData = await dataImport.parseDataFromCsv(csvData);
 await dataImport.sendEventsToSnowplow(subscriptionData, 'subscriptions');

  // csvData = await dataImport.getDataFromS3(`unsubscriptions/unsubscriptions_${fileSuffix}.csv.gz`);
  // let unsubscriptionData = await dataImport.parseDataFromCsv(csvData);
  // await dataImport.sendEventsToSnowplow(unsubscriptionData, 'unsubscriptions');
};


const processOneDay = async () => {
  let processDate = new Date(2018, 9, 13, 5, 5, 0, 0);
  formattedDate = util.buildFormattedDate(new Date(processDate.valueOf()));
  console.log(`${new Date().toISOString()} Running with date ${formattedDate}`);

  await dataImport.trackEvents(formattedDate, 'opens');
  await dataImport.trackEvents(formattedDate, 'clicks');
  await dataImport.trackEvents(formattedDate, 'subscriptions');
  await dataImport.trackEvents(formattedDate, 'unsubscriptions');
};

const sleep = promisify(setTimeout);

const processRemaining = async () => {
  let day = 17;
  let month = 4; // 0 based
  let maxDay = 0;
  let year = 2019;

  while (true) {
    switch(month) {
      case 9:
      case 11:
        maxDay = 31;
        break;
      case 10:
      case 3:
        maxDay = 30;
        break;
      case 4:
        maxDay = 17;
        break;
    }

    await processOneDayParams(year, month, day);

    console.log(`Month ${month}`);
    console.log(`Day ${day}`);
    if (month === 0 && day === 4) {
      return;
    }

    if (day === maxDay) {
      day = 1;

      if (month === 11) {
        month = 0;
      } else {
        month++;
      }
    } else {
      day++;
    }

    await sleep(1000 * 60 * 25);
  }
};

const processOneDayParams = async (year, month, day) => {
  let processDate = new Date(year, month, day, 5, 5, 0, 0);
  formattedDate = util.buildFormattedDate(new Date(processDate.valueOf()));
  console.log(`${new Date().toISOString()} Running with date ${formattedDate}`);

  await dataImport.trackEvents(formattedDate, 'opens');
  await dataImport.trackEvents(formattedDate, 'clicks');
  await dataImport.trackEvents(formattedDate, 'subscriptions');
  await dataImport.trackEvents(formattedDate, 'unsubscriptions');
};

//runProcess();
// setRedisDate();
// getRedisDate();
oneOffProcess().catch((error) => {
 console.log('Error:', error);
});

// Month is 0 based
// processOneDayParams(2021, 11, 1).then(() => {
//   setRedisDate();
//   // console.log('set redis date here.');
// }).catch((error) => {
//   console.log('Error:', error);
// });

//(async () => {
//  try {
//    await processOneDayParams(2019, 9, 16);
//    await setRedisDate();
//  } catch (error) {
//    console.log('Error:', error);
//  }
//})
//processRemaining().catch((error) => {
//  console.log('Error:', error);
//});

//(async () => {
//  try {
//    await sleep(processRemaining, 3000);
//  } catch (error) {
//    console.log('Error:', error);
//  }
//})();
