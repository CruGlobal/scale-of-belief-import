const snowplow = require('snowplow-tracker');
const moment = require('moment-timezone');
const util = require('./util')

const ACTION_CLICK = 'click-link';
const ACTION_OPEN = 'open-email';

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
  Object.keys(data).forEach((element, key, _array) => {
    data[element] = util.removeNonDisplayable(data[element]);
  });

  const tracker = snowplow.tracker([emitter], 'ac', 'adobecampaign', false);

  const adobeCampaignId = encodeURIComponent(data['adobe_campaign_id']);

  let campaignCode;
  if (data['ext_campaign_code']) {
    campaignCode = encodeURIComponent(data['ext_campaign_code']);
  }

  const ssoGuid = data['sso_guid'];
  const grMasterPersonId = data['gr_master_person_id'];

  let idData = { gr_master_person_id: grMasterPersonId };

  if (ssoGuid) {
    idData.sso_guid = ssoGuid;
  }

  let uri = `campaign://${action}/${adobeCampaignId}`;

  if (campaignCode) {
    uri = `${uri}/${campaignCode}`;
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

  // Log date is using the Adobe Campaign Standard server's timezone, which is EST/EDT.
  let logDate = moment.tz(data['log_date'], 'America/New_York');

  let label;

  switch (action) {
    case ACTION_CLICK:
      label = data['click_url'];
      break;
    case ACTION_OPEN:
      label = campaignCode ? campaignCode : null
  }

  tracker.addPayloadPair('url', uri);
  tracker.addPayloadPair('page', data['delivery_label']);
  tracker.trackStructEvent(
    'campaign',
    action,
    label, // label
    data['adobe_campaign_label'], // property
    null, // value
    customContexts,
    logDate.valueOf()
  );
};

module.exports = {
  trackEvent: (data, type) => {
    switch (type) {
      case 'opens':
        track(data, ACTION_OPEN);
        break;
      case 'clicks':
        track(data, ACTION_CLICK);
        break;
    }
  },
  flush: () => {
    /* istanbul ignore next */
    emitter.flush();
  }
};
