const AWS = require('aws-sdk');
const csvParse = require('csv-parse');
const snowplow = require('./snowplow');
const util = require('./util');

AWS.config.update({region: 'us-east-1'});
AWS.config.setPromisesDependency(null); // Use promises instead of callbacks
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const self = module.exports = {
  /* istanbul ignore next */
  handler: (event, context, callback) => {
    /* istanbul ignore next */
    const handleCampaignData = async () => {
      try {
        const formattedDate = util.buildFormattedDate(new Date());
        let fileName = await self.determineFileName('opens', formattedDate);
        let csvData = await self.getDataFromS3(fileName);
        let openData = await self.parseDataFromCsv(csvData);
        await self.sendOpensToSnowplow(openData);

        fileName = await self.determineFileName('clicks', formattedDate);
        csvData = await self.getDataFromS3(fileName);
        let clickData = await self.parseDataFromCsv(csvData);
        // Clicks contains the records from Opens also, but not vice versa. We need to not count opens as clicks.
        clickData = self.filterClickData(clickData, openData);
        await self.sendClicksToSnowplow(clickData);
      } catch (error) {
        throw new Error(error);
      }
    };

    /* istanbul ignore next */
    handleCampaignData().then(() => {
      callback(null, { statusCode: 204 });
    }).catch((error) => {
      callback('Failed to send campaign data to snowplow: ' + error);
    });
  },
  determineFileName: (type, formattedDate) => {
    const params = {
      Bucket: process.env.CAMPAIGN_SNOWPLOW_S3_BUCKET,
      Prefix: `${type}_${formattedDate}`
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
      return data['Body'];
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
  sendClicksToSnowplow: (data) => {
    for (let i = 0; i < data.length; i++) {
      snowplow.trackClick(data[i]);
    }
    snowplow.flush();
  },
  sendOpensToSnowplow: (data) => {
    for (let i = 0; i < data.length; i++) {
      snowplow.trackOpen(data[i]);
    }
    snowplow.flush();
  },
  filterClickData: (clickData, openData) => {
    const groupedClicks = util.groupBy(clickData, 'gr_master_person_id');
    const groupedOpens = util.groupBy(openData, 'gr_master_person_id');
    let filteredClicks = new Set([]);

    for (let groupKey in groupedClicks) {

      // If there are more clicks than opens for a given email/recipient, we know the recipient clicked something
      if (groupedClicks[groupKey].length > groupedOpens[groupKey].length) {

        for (let j in groupedClicks[groupKey]) {
          if (!util.containsObject(groupedOpens[groupKey], groupedClicks[groupKey][j])) {
            filteredClicks.add(groupedClicks[groupKey][j]);
          }
        }
      }
    }

    return filteredClicks;
  }
};