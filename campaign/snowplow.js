const snowplow = require('snowplow-tracker');
const moment = require('moment-timezone');
const util = require('./util')

const ACTION_CLICK = 'click-link';
const ACTION_OPEN = 'open-email';
const ACTION_SUBSCRIBE = 'subscribe';
const ACTION_UNSUBSCRIBE = 'unsubscribe';

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

  const ssoGuid = data['sso_guid'];
  const grMasterPersonId = data['gr_master_person_id'];

  let idData = { gr_master_person_id: grMasterPersonId };

  if (ssoGuid) {
    idData.sso_guid = ssoGuid;
  }

  let uri = buildUri(action, data);

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

  let label;
  let property;
  let page;
  // Dates are using the Adobe Campaign Standard server's timezone, which is EST/EDT.
  let logDate = moment.tz(data['log_date'], 'America/New_York');

  switch (action) {
    case ACTION_CLICK:
      label = data['click_url'];
      property = data['adobe_campaign_label'];
      page = data['delivery_label'];
      break;
    case ACTION_OPEN:
      let campaignCode;
      if (data['ext_campaign_code']) {
        campaignCode = encodeURIComponent(data['ext_campaign_code']);
      }

      label = campaignCode ? campaignCode : null;
      property = data['adobe_campaign_label'];
      page = data['delivery_label'];
      break;
    case ACTION_SUBSCRIBE:
    case ACTION_UNSUBSCRIBE:
      label = data['cru_service_name'] ? data['cru_service_name'] : null;
      property = data['origin'];
      page = data['service_label'];
  }

  tracker.addPayloadPair('url', uri);
  tracker.addPayloadPair('page', page);
  tracker.trackStructEvent(
    'campaign',
    action,
    label, // label
    property,
    null, // value
    customContexts,
    logDate.valueOf()
  );
};

const buildUri = (action, data) => {
  let uri = `campaign://${action}`;

  let identifier;

  if (data['adobe_campaign_id']) {
    identifier = encodeURIComponent(data['adobe_campaign_id']);
  }
  if (data['service_id']) {
    identifier = encodeURIComponent(data['service_id']);
  }

  uri = `${uri}/${identifier}`;

  let campaignCode;
  if (data['ext_campaign_code']) {
    campaignCode = encodeURIComponent(data['ext_campaign_code']);
  }
  if (campaignCode) {
    uri = `${uri}/${campaignCode}`;
  }

  return uri;
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
      case 'subscriptions':
        track(data, ACTION_SUBSCRIBE);
        break;
      case 'unsubscriptions':
        track(data, ACTION_UNSUBSCRIBE);
    }
  },
  flush: () => {
    /* istanbul ignore next */
    emitter.flush();
  }
};
