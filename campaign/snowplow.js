const snowplow = require('snowplow-tracker')
const moment = require('moment-timezone')
const util = require('./util')
const SnowplowEventTracker = require('./snowplow-event-tracker')

const ACTION_CLICK = 'click-link'
const ACTION_OPEN = 'open-email'
const ACTION_SUBSCRIBE = 'subscribe'
const ACTION_UNSUBSCRIBE = 'unsubscribe'

const eventTracker = new SnowplowEventTracker()
const emitter = snowplow.emitter(
  's.cru.org', // Collector endpoint
  'https', // Optionally specify a method - http is the default
  null, // Optionally specify a port
  'POST', // Method - defaults to GET
  null, // Only send events once n are buffered. Defaults to 1 for GET requests and 10 for POST requests.
  (error, body, response) => {
    /* istanbul ignore next */
    if (error) {
      console.log('Request to Collector failed!', error)
    } else {
      const requestBody = body.request.body
      const data = JSON.parse(requestBody).data

      if (data && data[0]) {
        const action = data[0]['se_ac']
        eventTracker.emit('ping', action, data.length)
      }
    }
  },
  { maxSockets: 2 }
)

const track = (data, action) => {
  Object.keys(data).forEach((element, key, _array) => {
    data[element] = util.removeNonDisplayable(data[element])
  })

  const tracker = snowplow.tracker([emitter], 'adobecampaign-nodejs', 'adobecampaign', false)

  const ssoGuid = data['sso_guid']
  const grMasterPersonId = data['gr_master_person_id']
  const acsEmail = data['acs_email']

  const idData = { gr_master_person_id: grMasterPersonId }
  const acsData = { acs_label: data['service_label'] ? data['service_label'] : data['delivery_label'] }

  if (ssoGuid) {
    idData['sso_guid'] = ssoGuid
  }

  if (acsEmail) {
    idData['acs_email'] = acsEmail
  }

  if (data['click_url']) {
    acsData['acs_click_url'] = data['click_url']
  }

  const uri = buildUri(action, data)

  const customContexts = [
    {
      schema: 'iglu:org.cru/ids/jsonschema/1-0-6',
      data: idData
    },
    {
      schema: 'iglu:org.cru/content-scoring/jsonschema/1-0-0',
      data: {
        uri: uri
      }
    },
    {
      schema: 'iglu:org.cru/acs_context/jsonschema/1-0-0',
      data: acsData
    }
  ]

  let label
  let property
  let page
  // Dates are using the Adobe Campaign Standard server's timezone, which is EST/EDT.
  const logDate = moment.tz(data['log_date'], 'America/New_York')

  switch (action) {
    case ACTION_CLICK:
      label = data['click_url']
      property = data['adobe_campaign_label']
      page = data['delivery_label']
      break
    case ACTION_OPEN:
      let campaignCode
      if (data['ext_campaign_code']) {
        campaignCode = encodeURIComponent(data['ext_campaign_code'])
      }

      label = campaignCode || null
      property = data['adobe_campaign_label']
      page = data['delivery_label']
      break
    case ACTION_SUBSCRIBE:
    case ACTION_UNSUBSCRIBE:
      label = data['cru_service_name'] ? data['cru_service_name'] : null
      property = data['origin']
      page = data['service_label']
  }

  tracker.addPayloadPair('url', uri)
  tracker.addPayloadPair('page', page)
  tracker.trackStructEvent(
    'campaign',
    action,
    label, // label
    property || null,
    null, // value
    customContexts,
    logDate.valueOf()
  )
}

const buildUri = (action, data) => {
  let uri = `campaign://${action}`

  let identifier

  if (data['adobe_campaign_label']) {
    identifier = encodeURIComponent(data['adobe_campaign_label'])
  } else if (data['delivery_label']) {
    identifier = encodeURIComponent(data['delivery_label'])
  } else if (data['service_label']) {
    identifier = encodeURIComponent(data['service_label'])
  }

  uri = `${uri}/${identifier}`

  let campaignCode
  if (data['ext_campaign_code']) {
    campaignCode = encodeURIComponent(data['ext_campaign_code'])
  }
  if (campaignCode) {
    uri = `${uri}/${campaignCode}`
  }

  return uri
}

module.exports = {
  trackEvent: (data, type) => {
    switch (type) {
      case 'opens':
        track(data, ACTION_OPEN)
        break
      case 'clicks':
        track(data, ACTION_CLICK)
        break
      case 'subscriptions':
        track(data, ACTION_SUBSCRIBE)
        break
      case 'unsubscriptions':
        track(data, ACTION_UNSUBSCRIBE)
    }
  },
  flush: () => {
    /* istanbul ignore next */
    emitter.flush()
  },
  getSnowplowEventTracker: () => {
    return eventTracker
  },
  // For testing purposes only
  getEmitter: () => {
    return emitter
  }
}
