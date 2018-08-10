const dataImport = require('./import');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const snowplow = require('./snowplow');

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
      expect(firstRecord['job_id']).toEqual('bill-test-job-id');
      expect(firstRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(firstRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(firstRecord['sso_guid']).toEqual('test-guid-1');
      expect(firstRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(firstRecord['log_date']).toEqual('2018-07-30T09:20:49.000');

      const secondRecord = parsedData[1];
      expect(secondRecord['job_id']).toEqual('bill-test-job-id');
      expect(secondRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(secondRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(secondRecord['sso_guid']).toEqual('test-guid-2');
      expect(secondRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(secondRecord['log_date']).toEqual('2018-07-30T09:12:30.000');
      done();
    });
  });

  it('Should parse the opens CSV data', done => {
    const csvData = fs.readFileSync(path.join(__fixturesDir, 'campaign', 'opens.csv'), 'utf-8');

    expect(csvData).toBeDefined();

    dataImport.parseDataFromCsv(csvData).then((parsedData) => {
      expect(parsedData).toBeDefined();
      expect(parsedData.length).toEqual(3); // 2 records in the CSV

      const firstRecord = parsedData[0];
      expect(firstRecord['job_id']).toEqual('bill-test-job-id');
      expect(firstRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(firstRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(firstRecord['sso_guid']).toEqual('test-guid-1');
      expect(firstRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(firstRecord['log_date']).toEqual('2018-07-30T09:20:49.557');

      const secondRecord = parsedData[1];
      expect(secondRecord['job_id']).toEqual('bill-test-job-id');
      expect(secondRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(secondRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(secondRecord['sso_guid']).toEqual('test-guid-2');
      expect(secondRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(secondRecord['log_date']).toEqual('2018-07-30T09:12:33.310');

      const thirdRecord = parsedData[2];
      expect(thirdRecord['job_id']).toEqual('bill-test-job-id');
      expect(thirdRecord['ext_campaign_code']).toEqual('bill-test-campaign');
      expect(thirdRecord['delivery_label']).toEqual('[2018/07/26] Multilingual email (Chinese)');
      expect(thirdRecord['sso_guid']).toEqual('test-guid-2');
      expect(thirdRecord['gr_master_person_id']).toEqual('test-gr-master-person-id');
      expect(thirdRecord['log_date']).toEqual('2018-07-30T09:12:30.000');
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
      expect(fileName).toEqual('clicks_20180730_114200.csv');
      done();
    });
  });

  it('Should determine the opens filename', done => {
    const formattedDate = '20180730';
    dataImport.determineFileName('opens', formattedDate).then((fileName) => {
      expect(fileName).toEqual('opens_20180730_114200.csv');
      done();
    });
  });

  it('Should get CSV data from S3 for clicks', done => {
    const fileName = 'clicks_20180730_114200.csv';
    dataImport.getDataFromS3(fileName).then((csvData) => {
      expect(csvData).toBeDefined();
      expect(csvData).toEqual(expect.stringContaining('clicks'));
      done();
    });
  });

  it('Should get CSV data from S3 for opens', done => {
    const fileName = 'opens_20180730_114200.csv';
    dataImport.getDataFromS3(fileName).then((csvData) => {
      expect(csvData).toBeDefined();
      expect(csvData).not.toEqual(expect.stringContaining('clicks'));
      done();
    });
  });

  it('Should send clicks to snowplow', () => {
    const spyTrack = jest.spyOn(snowplow, 'trackClick').mockImplementation(() => jest.fn());
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

    dataImport.sendClicksToSnowplow(data);
    expect(spyTrack).toHaveBeenCalledTimes(2);
    expect(spyFlush).toHaveBeenCalled();
  });

  it('Should send opens to snowplow', () => {
    const spyTrack = jest.spyOn(snowplow, 'trackOpen').mockImplementation(() => jest.fn());
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

    dataImport.sendOpensToSnowplow(data);
    expect(spyTrack).toHaveBeenCalledTimes(2);
    expect(spyFlush).toHaveBeenCalled();
  });

  it('Should filter clicks to remove duplicates', () => {
    const clickData = [
      {
        gr_master_person_id: 'some-gr-id',
        sso_guid: 'some-guid',
        log_date: '2018-07-30 07:00:00'
      },
      {
        gr_master_person_id: 'some-gr-id',
        sso_guid: 'other-guid',
        log_date: '2018-07-30 14:00:00'
      },
      {
        gr_master_person_id: 'other-gr-id',
        sso_guid: 'third-guid',
        log_date: '2018-07-30 02:22:11'
      },
      {
        gr_master_person_id: 'other-gr-id',
        sso_guid: 'third-guid',
        log_date: '2018-07-30 04:00:00'
      },
      {
        gr_master_person_id: 'other-gr-id',
        sso_guid: 'third-guid',
        log_date: '2018-07-30 04:22:00'
      }
    ];

    const openData = [
      {
        gr_master_person_id: 'some-gr-id',
        sso_guid: 'some-guid',
        log_date: '2018-07-30 07:00:00'
      },
      {
        gr_master_person_id: 'some-gr-id',
        sso_guid: 'other-guid',
        log_date: '2018-07-30 14:00:00'
      },
      {
        gr_master_person_id: 'other-gr-id',
        sso_guid: 'third-guid',
        log_date: '2018-07-30 02:22:11'
      },
      {
        gr_master_person_id: 'other-gr-id',
        sso_guid: 'third-guid',
        log_date: '2018-07-30 04:00:00'
      },
      {
        gr_master_person_id: 'third-gr-id',
        sso_guid: 'fourth_guid',
        log_date: '2018-07-30 16:33:21'
      }
    ];

    const filteredClicks = dataImport.filterClickData(clickData, openData);
    expect(filteredClicks).toBeDefined();
    expect(filteredClicks.size).toEqual(1);
    filteredClicks.forEach((click) => {
      expect(click['gr_master_person_id']).toEqual('other-gr-id');
      expect(click['log_date']).toEqual('2018-07-30 04:22:00');
    });
  });

  it('Should filter correctly when there are no clicks', () => {
      const clickData = [];

      const openData = [
        {
          gr_master_person_id: 'some-gr-id',
          sso_guid: 'some-guid',
          log_date: '2018-07-30 07:00:00'
        },
        {
          gr_master_person_id: 'some-gr-id',
          sso_guid: 'other-guid',
          log_date: '2018-07-30 14:00:00'
        },
        {
          gr_master_person_id: 'other-gr-id',
          sso_guid: 'third-guid',
          log_date: '2018-07-30 02:22:11'
        },
        {
          gr_master_person_id: 'other-gr-id',
          sso_guid: 'third-guid',
          log_date: '2018-07-30 04:00:00'
        },
        {
          gr_master_person_id: 'third-gr-id',
          sso_guid: 'fourth_guid',
          log_date: '2018-07-30 16:33:21'
        }
      ];

      const filteredClicks = dataImport.filterClickData(clickData, openData);
      expect(filteredClicks).toBeDefined();
      expect(filteredClicks.size).toEqual(0);
    });
});