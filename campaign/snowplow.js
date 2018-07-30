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

const track = (data, action) => {
  const tracker = snowplow.tracker([emitter], 'cf', 'score-bulk-import', false);

  const jobId = encodeURIComponent(data['job_id']);

  let campaignCode;
  if (data['ext_campaign_code']) {
    campaignCode = encodeURIComponent(data['ext_campaign_code']);
  }

  const pageTitle = encodeURIComponent(data['delivery_label']);
  const ssoGuid = data['sso_guid'];
  const grMasterPersonId = data['gr_master_person_id'];

  let idData = { gr_master_person_id: grMasterPersonId };

  if (ssoGuid) {
    idData.sso_guid = ssoGuid;
  }

  let uri = `campaign://${action}/${jobId}`;

  if (campaignCode) {
    uri = uri + `/${campaignCode}`;
  }

  const customContexts = [
    {
      schema: 'iglu:org.cru/ids/jsonschema/1-0-3',
      data: idData
    },
    {
      schema: 'iglu:org.cru/content-scoring/jsonschema/1-0-0',
      data: {
        uri: uri
      }
    }
  ];

  tracker.addPayloadPair('url', uri);
  tracker.addPayloadPair('page', pageTitle);
  tracker.trackStructEvent(
    'campaign',
    action,
    data['delivery_label'], // label
    data['adobe_campaign_label'], // property
    campaignCode ? campaignCode : null, // value
    customContexts,
    data['log_date']
  );
};

module.exports = {
  trackClick: (data) => {
    track(data, 'click-link');
  },
  trackOpen: (data) => {
    track(data, 'open-email');
  },
  flush: () => {
    /* istanbul ignore next */
    emitter.flush();
  }
};
