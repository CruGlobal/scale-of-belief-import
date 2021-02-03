const snowplow = require('snowplow-tracker')
const campaignSnowplow = require('./snowplow')

describe('Campaign Snowplow', () => {
  it('Should be defined', () => {
    expect(campaignSnowplow).toBeDefined()
  })

  const idSchema = 'iglu:org.cru/ids/jsonschema/1-0-6'
  const scoreSchema = 'iglu:org.cru/content-scoring/jsonschema/1-0-0'
  const acsSchema = 'iglu:org.cru/acs_context/jsonschema/1-0-0'

  it('Should track an open event with an external campaign code', () => {
    const mockTrackStructEvent = jest.fn()
    const mockAddPayloadPair = jest.fn()

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

    const data = {
      ext_campaign_code: 'campaign-code',
      delivery_label: 'Some_Label - with [square brackets] (11/7/18) v.2',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018-07-30T09:20:49.333',
      acs_email: 'somerandomemail@test.com'
    }

    campaignSnowplow.trackEvent(data, 'opens')
    expect(trackerSpy).toHaveBeenCalled()

    const uri = 'campaign://open-email/Some_Label%20-%20with%20%5Bsquare%20brackets%5D%20(11%2F7%2F18)%20v.2/campaign-code'

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id', acs_email: 'somerandomemail@test.com' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      },
      {
        schema: acsSchema,
        data: {
          acs_label: data.delivery_label
        }
      }
    ]

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'open-email',
      'campaign-code',
      null,
      null,
      customContexts,
      Date.parse(data['log_date']))

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri)
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', data['delivery_label'])
  })

  it('Should track an open event without an external campaign code', () => {
    const mockTrackStructEvent = jest.fn()
    const mockAddPayloadPair = jest.fn()

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

    const data = {
      delivery_label: 'Some Label',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018-07-30T09:20:49.557',
      acs_email: 'somerandomemail@test.com'
    }

    campaignSnowplow.trackEvent(data, 'opens')
    expect(trackerSpy).toHaveBeenCalled()

    const uri = 'campaign://open-email/Some%20Label'

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id', acs_email: 'somerandomemail@test.com' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      },
      {
        schema: acsSchema,
        data: {
          acs_label: data.delivery_label
        }
      }
    ]

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'open-email',
      null,
      null,
      null,
      customContexts,
      Date.parse(data['log_date']))

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri)
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some Label')
  })

  it('Should track an open event with an sso guid', () => {
    const mockTrackStructEvent = jest.fn()
    const mockAddPayloadPair = jest.fn()

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

    const data = {
      delivery_label: 'Some Label',
      sso_guid: 'some-guid',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018-07-30T09:20:49.000',
      acs_email: 'somerandomemail@test.com'
    }

    campaignSnowplow.trackEvent(data, 'opens')
    expect(trackerSpy).toHaveBeenCalled()

    const uri = 'campaign://open-email/Some%20Label'

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id', sso_guid: 'some-guid', acs_email: 'somerandomemail@test.com' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      },
      {
        schema: acsSchema,
        data: {
          acs_label: data.delivery_label
        }
      }
    ]

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'open-email',
      null,
      null,
      null,
      customContexts,
      Date.parse(data['log_date']))

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri)
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some Label')
  })

  it('Should track a click event with an external campaign code and sso guid', () => {
    const mockTrackStructEvent = jest.fn()
    const mockAddPayloadPair = jest.fn()

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

    const data = {
      ext_campaign_code: 'campaign-code',
      delivery_label: 'Some Label',
      sso_guid: 'some-guid',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018-07-30T09:20:49.454',
      click_url: 'https://www.cru.org',
      acs_email: 'somerandomemail@test.com'
    }

    campaignSnowplow.trackEvent(data, 'clicks')
    expect(trackerSpy).toHaveBeenCalled()

    const uri = 'campaign://click-link/Some%20Label/campaign-code'

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id', sso_guid: 'some-guid', acs_email: 'somerandomemail@test.com' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      },
      {
        schema: acsSchema,
        data: { acs_label: data.delivery_label, acs_click_url: data.click_url }
      }
    ]

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'click-link',
      'https://www.cru.org',
      null,
      null,
      customContexts,
      Date.parse(data['log_date']))

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri)
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some Label')
  })

  it('Should use the adobe campaign label if it exists', () => {
    const mockTrackStructEvent = jest.fn()
    const mockAddPayloadPair = jest.fn()

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

    const data = {
      adobe_campaign_label: 'Campaign Label',
      delivery_label: 'Some Label',
      sso_guid: 'some-guid',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018-07-30T09:20:49.454',
      click_url: 'https://www.cru.org',
      acs_email: 'somerandomemail@test.com'
    }

    campaignSnowplow.trackEvent(data, 'clicks')

    const uri = 'campaign://click-link/Campaign%20Label'

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id', sso_guid: 'some-guid', acs_email: 'somerandomemail@test.com' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      },
      {
        schema: acsSchema,
        data: {
          acs_label: data.delivery_label, acs_click_url: data.click_url
        }
      }
    ]

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'click-link',
      'https://www.cru.org',
      'Campaign Label',
      null,
      customContexts,
      Date.parse(data['log_date']))

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri)
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some Label')
  })

  it('Should track a subscription event', () => {
    const mockTrackStructEvent = jest.fn()
    const mockAddPayloadPair = jest.fn()

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

    const data = {
      service_label: 'Service Label',
      cru_service_name: 'Cru Service Name',
      origin: 'origin',
      sso_guid: 'some-guid',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018-08-10T17:04:50.419',
      acs_email: 'somerandomemail@test.com'
    }

    campaignSnowplow.trackEvent(data, 'subscriptions')
    expect(trackerSpy).toHaveBeenCalled()

    const uri = 'campaign://subscribe/Service%20Label'

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id', sso_guid: 'some-guid', acs_email: 'somerandomemail@test.com' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      },
      {
        schema: acsSchema,
        data: { acs_label: data.service_label }
      }
    ]

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'subscribe',
      'Cru Service Name',
      'origin',
      null,
      customContexts,
      Date.parse(data['log_date']))

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri)
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Service Label')
  })

  it('Should track an unsubscription event', () => {
    const mockTrackStructEvent = jest.fn()
    const mockAddPayloadPair = jest.fn()

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

    const data = {
      service_label: 'Service Label',
      cru_service_name: 'Cru Service Name',
      origin: 'origin',
      sso_guid: 'some-guid',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018-08-10T17:04:50.419',
      acs_email: 'somerandomemail@test.com'
    }

    campaignSnowplow.trackEvent(data, 'unsubscriptions')
    expect(trackerSpy).toHaveBeenCalled()

    const uri = 'campaign://unsubscribe/Service%20Label'

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id', sso_guid: 'some-guid', acs_email: 'somerandomemail@test.com' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      },
      {
        schema: acsSchema,
        data: {
          acs_label: data.service_label
        }
      }
    ]

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'unsubscribe',
      'Cru Service Name',
      'origin',
      null,
      customContexts,
      Date.parse(data['log_date']))

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri)
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Service Label')
  })

  describe('Event Tracker', () => {
    it('should emit a "ping" event on emitter callback', done => {
      const requestBody = JSON.stringify({ data: [{ se_ac: 'open-email' }] })
      const mockBody = {
        request: {
          body: requestBody
        }
      }

      const eventTracker = campaignSnowplow.getSnowplowEventTracker()
      eventTracker.on('ping', (eventType, numProcessed) => {
        expect(eventType).toEqual('open-email')
        expect(numProcessed).toEqual(1)
        done()
      })

      campaignSnowplow.getEmitter().flush(mockBody)
    })
  })
})
