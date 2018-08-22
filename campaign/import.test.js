const dataImport = require('./import');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const snowplow = require('./snowplow');
const redis = require('redis');

describe('Campaign Import', () => {
  it('Should be defined', () => {
    expect(dataImport).toBeDefined();
  });

  it('Should parse the clicks CSV data', done => {
    const csvData = fs.readFileSync(path.join(__fixturesDir, 'campaign', 'clicks.csv'), 'utf-8');

    expect(csvData).toBeDefined();

    dataImport.parseDataFromCsv(csvData).then((parsedData) => {
      expect(parsedData).toBeDefined();
      expect(parsedData.length).toEqual(2); // 2 records in the CSV

      const firstRecord = parsedData[0];
      expect(firstRecord['adobe_campaign_id']).toEqual('CMP64');
      expect(firstRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(firstRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(firstRecord['sso_guid']).toEqual('test-guid-1');
      expect(firstRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(firstRecord['log_date']).toEqual('2018-07-30T09:20:49.000');
      expect(firstRecord['click_url']).toEqual('https://google.com');

      const secondRecord = parsedData[1];
      expect(secondRecord['adobe_campaign_id']).toEqual('CMP64');
      expect(secondRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(secondRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(secondRecord['sso_guid']).toEqual('test-guid-2');
      expect(secondRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(secondRecord['log_date']).toEqual('2018-07-30T09:12:30.000');
      expect(secondRecord['click_url']).toEqual('https://www.cru.org');
      done();
    });
  });

  it('Should parse the opens CSV data', done => {
    const csvData = fs.readFileSync(path.join(__fixturesDir, 'campaign', 'opens.csv'), 'utf-8');

    expect(csvData).toBeDefined();

    dataImport.parseDataFromCsv(csvData).then((parsedData) => {
      expect(parsedData).toBeDefined();
      expect(parsedData.length).toEqual(3); // 3 records in the CSV

      const firstRecord = parsedData[0];
      expect(firstRecord['adobe_campaign_id']).toEqual('CMP64');
      expect(firstRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(firstRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(firstRecord['sso_guid']).toEqual('test-guid-1');
      expect(firstRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(firstRecord['log_date']).toEqual('2018-07-30T09:20:49.557');

      const secondRecord = parsedData[1];
      expect(secondRecord['adobe_campaign_id']).toEqual('CMP64');
      expect(secondRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(secondRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(secondRecord['sso_guid']).toEqual('test-guid-2');
      expect(secondRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(secondRecord['log_date']).toEqual('2018-07-30T09:12:33.310');

      const thirdRecord = parsedData[2];
      expect(thirdRecord['adobe_campaign_id']).toEqual('CMP64');
      expect(thirdRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(thirdRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(thirdRecord['sso_guid']).toEqual('test-guid-2');
      expect(thirdRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(thirdRecord['log_date']).toEqual('2018-07-30T09:12:30.000');
      done();
    });
  });

  it('Should parse the subscriptions CSV data', done => {
    const csvData = fs.readFileSync(path.join(__fixturesDir, 'campaign', 'subscriptions.csv'), 'utf-8');

    expect(csvData).toBeDefined();

    dataImport.parseDataFromCsv(csvData).then((parsedData) => {
      expect(parsedData).toBeDefined();
      expect(parsedData.length).toEqual(2); // 2 records in the CSV

      const firstRecord = parsedData[0];
      expect(firstRecord['service_id']).toEqual('SVC40');
      expect(firstRecord['service_label']).toEqual('Bill Newsletter');
      expect(firstRecord['origin']).toEqual('Bill Origin');
      expect(firstRecord['sso_guid']).toEqual('test-guid-1');
      expect(firstRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(firstRecord['log_date']).toEqual('2018-08-10T17:04:50.419');

      const secondRecord = parsedData[1];
      expect(firstRecord['service_id']).toEqual('SVC40');
      expect(firstRecord['service_label']).toEqual('Bill Newsletter');
      expect(firstRecord['origin']).toEqual('Bill Origin');
      expect(secondRecord['sso_guid']).toEqual('test-guid-2');
      expect(secondRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(secondRecord['log_date']).toEqual('2018-08-10T17:04:50.419');

      done();
    });
  });

  it('Should parse the unsubscriptions CSV data', done => {
    const csvData = fs.readFileSync(path.join(__fixturesDir, 'campaign', 'unsubscriptions.csv'), 'utf-8');

    expect(csvData).toBeDefined();

    dataImport.parseDataFromCsv(csvData).then((parsedData) => {
      expect(parsedData).toBeDefined();
      expect(parsedData.length).toEqual(2); // 2 records in the CSV

      const firstRecord = parsedData[0];
      expect(firstRecord['service_id']).toEqual('SVC40');
      expect(firstRecord['service_label']).toEqual('Bill Newsletter');
      expect(firstRecord['origin']).toEqual('Bill Origin');
      expect(firstRecord['sso_guid']).toEqual('test-guid-1');
      expect(firstRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(firstRecord['log_date']).toEqual('2018-08-13T17:02:55.224');

      const secondRecord = parsedData[1];
      expect(firstRecord['service_id']).toEqual('SVC40');
      expect(firstRecord['service_label']).toEqual('Bill Newsletter');
      expect(firstRecord['origin']).toEqual('Bill Origin');
      expect(secondRecord['sso_guid']).toEqual('test-guid-2');
      expect(secondRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(secondRecord['log_date']).toEqual('2018-08-13T17:02:55.224');

      done();
    });
  });

  it('Should reject a malformed CSV', done => {
    const csvData = fs.readFileSync(path.join(__fixturesDir, 'campaign', 'error.csv'), 'utf-8');

    expect(csvData).toBeDefined();

    dataImport.parseDataFromCsv(csvData).then((parsedData) => {
      done.fail(new Error('Should have had an error reading error data.'));
    }).catch((error) => {
      expect(error).toBeDefined();
      done();
    });
  });

  it('Should determine the clicks filename', done => {
    const formattedDate = '20180730';
    dataImport.determineFileName('clicks', formattedDate).then((fileName) => {
      expect(fileName).toEqual('clicks_20180730_114200.csv.gz');
      done();
    });
  });

  it('Should determine the opens filename', done => {
    const formattedDate = '20180730';
    dataImport.determineFileName('opens', formattedDate).then((fileName) => {
      expect(fileName).toEqual('opens_20180730_114200.csv.gz');
      done();
    });
  });

  it('Should determine the subscriptions filename', done => {
    const formattedDate = '20180730';
    dataImport.determineFileName('subscriptions', formattedDate).then((fileName) => {
      expect(fileName).toEqual('subscriptions_20180730_114200.csv.gz');
      done();
    });
  });

  it('Should determine the unsubscriptions filename', done => {
    const formattedDate = '20180730';
    dataImport.determineFileName('unsubscriptions', formattedDate).then((fileName) => {
      expect(fileName).toEqual('unsubscriptions_20180730_114200.csv.gz');
      done();
    });
  });

  it('Should get CSV data from S3 for clicks', done => {
    const fileName = 'clicks_20180730_114200.csv.gz';
    dataImport.getDataFromS3(fileName).then((csvData) => {
      expect(csvData).toBeDefined();
      expect(csvData).toBeInstanceOf(Buffer);
      done();
    });
  });

  it('Should get CSV data from S3 for opens', done => {
    const fileName = 'opens_20180730_114200.csv.gz';
    dataImport.getDataFromS3(fileName).then((csvData) => {
      expect(csvData).toBeDefined();
      expect(csvData).toBeInstanceOf(Buffer);
      done();
    });
  });

  it('Should get CSV data from S3 for subscriptions', done => {
    const fileName = 'subscriptions_20180730_114200.csv.gz';
    dataImport.getDataFromS3(fileName).then((csvData) => {
      expect(csvData).toBeDefined();
      expect(csvData).toBeInstanceOf(Buffer);
      done();
    });
  });

  it('Should get CSV data from S3 for unsubscriptions', done => {
    const fileName = 'unsubscriptions_20180730_114200.csv.gz';
    dataImport.getDataFromS3(fileName).then((csvData) => {
      expect(csvData).toBeDefined();
      expect(csvData).toBeInstanceOf(Buffer);
      done();
    });
  });

  it('Should not error if we send a bad Key', done => {
    const fileName = 'non_existent.txt';
    dataImport.getDataFromS3(fileName).then((csvData) => {
      expect(csvData).toBeDefined();
      done();
    }).catch((error) => {
      done.fail('Fail!', error);
    });
  });

  describe('Send to Snowplow', () => {
    const spyTrack = jest.spyOn(snowplow, 'trackEvent').mockImplementation(() => jest.fn());

    it('Should send clicks to snowplow', () => {
      const spyFlush = jest.spyOn(snowplow, 'flush').mockImplementation(() => jest.fn());
      const data = [
        {
          gr_master_person_id: 'some-gr-id',
          sso_guid: 'some-guid'
        },
        {
          gr_master_person_id: 'other-gr-id',
          sso_guid: 'other-guid'
        }
      ];

      dataImport.sendEventsToSnowplow(data, 'clicks');
      expect(spyTrack).toHaveBeenCalledTimes(2);
      expect(spyFlush).toHaveBeenCalled();
    });

    it('Should send opens to snowplow', () => {
      spyTrack.mockClear();
      const spyFlush = jest.spyOn(snowplow, 'flush').mockImplementation(() => jest.fn());
      const data = [
        {
          gr_master_person_id: 'some-gr-id',
          sso_guid: 'some-guid'
        },
        {
          gr_master_person_id: 'other-gr-id',
          sso_guid: 'other-guid'
        }
      ];

      dataImport.sendEventsToSnowplow(data, 'opens');
      expect(spyTrack).toHaveBeenCalledTimes(2);
      expect(spyFlush).toHaveBeenCalled();
    });

    it('Should send subscriptions to snowplow', () => {
      spyTrack.mockClear();
      const spyFlush = jest.spyOn(snowplow, 'flush').mockImplementation(() => jest.fn());
      const data = [
        {
          gr_master_person_id: 'some-gr-id',
          sso_guid: 'some-guid'
        },
        {
          gr_master_person_id: 'other-gr-id',
          sso_guid: 'other-guid'
        }
      ];

      dataImport.sendEventsToSnowplow(data, 'subscriptions');
      expect(spyTrack).toHaveBeenCalledTimes(2);
      expect(spyFlush).toHaveBeenCalled();
    });

    it('Should send unsubscriptions to snowplow', () => {
      spyTrack.mockClear();
      const spyFlush = jest.spyOn(snowplow, 'flush').mockImplementation(() => jest.fn());
      const data = [
        {
          gr_master_person_id: 'some-gr-id',
          sso_guid: 'some-guid'
        },
        {
          gr_master_person_id: 'other-gr-id',
          sso_guid: 'other-guid'
        }
      ];

      dataImport.sendEventsToSnowplow(data, 'unsubscriptions');
      expect(spyTrack).toHaveBeenCalledTimes(2);
      expect(spyFlush).toHaveBeenCalled();
    });
  });
});