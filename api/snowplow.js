const snowplow = require('snowplow-tracker');
const e = snowplow.emitter(
    's.cru.org', // Collector endpoint
    'https', // Optionally specify a method - http is the default
    null, // Optionally specify a port
    'POST', // Method - defaults to GET
    null, // Only send events once n are buffered. Defaults to 1 for GET requests and 10 for POST requests.
    (error, body, response) => {
      console.log('snowplow request complete.', body.request.body)
      if (error) {
        console.log("Request to Scala Stream Collector failed!", error);
      }
    },
    { maxSockets: 2 }
);

module.exports = {
  track: (score, grMasterPersonId, page) => {
    let t = snowplow.tracker([e], 'cf', 'score-bulk-import', false);

    t.addPayloadPair('url', 'survey://bulk-import/self-selected-' + score);
    t.addPayloadPair('page', page);
    t.trackStructEvent('survey', 'self-selected', null, null, null, [{
      schema: 'iglu:org.cru/ids/jsonschema/1-0-3',
      data: {
        gr_master_person_id: grMasterPersonId
      }
    }, {
      schema: 'iglu:org.cru/content-scoring/jsonschema/1-0-0',
      data: {
        uri: 'survey://bulk-import/self-selected-' + score
      }
    }]);
  },
  flush: () => {
    e.flush();
  }
};
