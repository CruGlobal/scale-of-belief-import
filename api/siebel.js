const moment = require('moment-timezone');

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
  const tracker = snowplow.tracker([emitter], 'siebel', 'siebel', false);

  const inputData = JSON.parse(event.body);
  const uri = inputData['url'];
  const customContexts = [
    {
      schema: 'iglu:org.cru/ids/jsonschema/1-0-3',
      data: { gr_master_person_id: inputData['gr_master_person_id'] }
    },
    {
      schema: 'iglu:org.cru/content-scoring/jsonschema/1-0-0',
      data: {
        uri: uri
      }
    }
  ];

  const endOfPath = uri.lastIndexOf('/');
  let designation = '';

  if (endOfPath !== -1) {
    designation = uri.substring(endOfPath + 1);
  } else {
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

  tracker.addPayloadPair('url', uri);
  tracker.addPayloadPair('page', 'Donation');
  tracker.addPayloadPair('duid', inputData['duid']);
  tracker.trackStructEvent(
    'k_m',
    'scorable_action',
    label,
    inputData['eid'],
    null, // value
    customContexts,
    timestamp.valueOf()
  );
  emitter.flush();

  callback(null, { statusCode: 204 });
};
