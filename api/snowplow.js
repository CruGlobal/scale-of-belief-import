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
  track: (score, grMasterPersonId) => {
    let t = snowplow.tracker([e], 'cf', 'score-bulk-import', false);

    t.trackPageView('survey://bulk-import/self-selected-' + score, null, null, [{
      schema: 'iglu:org.cru/ids/jsonschema/1-0-3',
      data: {
        gr_master_person_id: grMasterPersonId
      }
    }]);
  },
  flush: () => {
    e.flush();
  }
};