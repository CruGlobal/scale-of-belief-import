const moment = require('moment-timezone');
const promiseRetry = require('promise-retry');
const gr = require('./gr.js');
const startsWith = require('lodash/startsWith');

module.exports.handler = (event, context, callback) => {
  const snowplow = require('snowplow-tracker');
  const emitter = snowplow.emitter(
      's.cru.org', // Collector endpoint
      'https', // Optionally specify a method - http is the default
      null, // Optionally specify a port
      'POST', // Method - defaults to GET
      null, // Only send events once n are buffered. Defaults to 1 for GET requests and 10 for POST requests.
      (error, body, response) => {
        /* istanbul ignore next */
        if (error) {
          console.log("Request to Collector failed!", error);
        }
      },
      { maxSockets: 2 }
  );
  const tracker = snowplow.tracker([emitter], 'siebel-nodejs', 'siebel', false);

  let inputData;
  try {
    inputData = JSON.parse(event.body);
  } catch (err) {
    console.error('Failed to parse payload: ' + event.body);
    callback(null, {
      statusCode: 400,
      body: 'Bad Payload.',
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Credentials' : true
      }
    });
    return;
  }

  const uri = inputData['url'];
  const endOfPath = uri.lastIndexOf('/');
  let designation = '';

  if (endOfPath !== -1) {
    designation = uri.substring(endOfPath + 1);
  } else {
    console.debug('Bad URI:', uri);
    callback(null, {
      statusCode: 400,
      body: 'Bad URI: ' + uri,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Credentials' : true
      },
    });
    return;
  }

  const label = 'siebel:donation:' + designation;
  const timestamp = moment.tz(inputData['dtm'], 'America/New_York');

  return promiseRetry((retry, number) => {
    return gr.findMasterPersonId(inputData['gr_master_person_id'], process.env['SIEBEL_GR_ACCESS_TOKEN'])
      .catch(error => {
        if (startsWith(error.message, 'Person missing master_person id')) {
          throw error
        } else {
          retry(error)
        }
      });
  }, {retries: 3, minTimeout: 100})
    .then((masterPersonId) => {
      const customContexts = [
        {
          schema: 'iglu:org.cru/ids/jsonschema/1-0-3',
          data: { gr_master_person_id: masterPersonId }
        },
        {
          schema: 'iglu:org.cru/content-scoring/jsonschema/1-0-0',
          data: {
            uri: uri
          }
        }
      ];

      tracker.addPayloadPair('url', uri);
      tracker.addPayloadPair('page', 'Donation');
      tracker.addPayloadPair('duid', inputData['duid']);
      tracker.trackStructEvent(
        'donation',
        'donate',
        label,
        inputData['eid'],
        null, // value
        customContexts,
        timestamp.valueOf()
      );
      emitter.flush();
      callback(null, { statusCode: 204 });
    }, error => {
      console.debug('Global Registry error:', error);
      callback(null, {
        statusCode: 400,
        body: 'Global Registry error: ' + error.message,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Credentials' : true
        },
      });
    });
};
