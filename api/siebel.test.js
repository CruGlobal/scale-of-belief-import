const snowplow = require('snowplow-tracker')
const siebel = require('./siebel')
const gr = require('./gr')
const moment = require('moment-timezone')

describe('Siebel Import', () => {
  it('Should be defined', () => {
    expect(siebel).toBeDefined()
  })

  const mockEmitter = {
    flush: jest.fn()
  }
  jest.spyOn(snowplow, 'emitter').mockImplementation(() => mockEmitter)

  const mockTrackStructEvent = jest.fn()
  const mockAddPayloadPair = jest.fn()

  const mockTracker = {
    addPayloadPair: mockAddPayloadPair,
    trackStructEvent: mockTrackStructEvent
  }
  const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker)

  it('Should track an event', done => {
    const grSpy = jest.spyOn(gr, 'findMasterPersonId')
    process.env.SIEBEL_GR_ACCESS_TOKEN = 'abc123'
    const event = {
      body: JSON.stringify(
        {
          url: 'siebel://donation/0123456',
          dtm: '2008-07-04 00:00:00',
          duid: 'siebel:account:000234567',
          eid: '1-26N-462',
          gr_master_person_id: 'some-guid'
        }
      )
    }

    grSpy.mockResolvedValue('a-master-person-guid')

    const customContexts = [
      {
        schema: 'iglu:org.cru/content-scoring/jsonschema/1-0-0',
        data: {
          uri: 'siebel://donation/0123456'
        }
      },
      {
        schema: 'iglu:org.cru/ids/jsonschema/1-0-3',
        data: { gr_master_person_id: 'a-master-person-guid' }
      }
    ]

    siebel.handler(event, null, (error, response) => {
      if (error) {
        done.fail()
      }
      expect(response).toEqual({ statusCode: 204 })
      expect(grSpy).toHaveBeenCalledWith('some-guid', 'abc123')
      expect(trackerSpy).toHaveBeenCalled()
      expect(mockTrackStructEvent).toHaveBeenCalledWith(
        'donation',
        'donate',
        'siebel:donation:0123456',
        '1-26N-462',
        null, // value
        customContexts,
        moment.tz('2008-07-04 00:00:00', 'America/New_York').valueOf()
      )
      expect(mockAddPayloadPair).toHaveBeenCalledWith('url', 'siebel://donation/0123456')
      expect(mockAddPayloadPair).toHaveBeenCalledWith('duid', 'siebel:account:000234567')
      expect(mockEmitter.flush).toHaveBeenCalled()
      done()
    })
  })

  it('Should fail if a bad URI is sent', done => {
    const event = {
      body: JSON.stringify(
        {
          url: 'bad-uri.com',
          dtm: '2008-07-04 00:00:00',
          duid: 'siebel:account:000234567',
          eid: '1-26N-462',
          gr_master_person_id: 'some-guid'
        }
      )
    }

    siebel.handler(event, null, (error, response) => {
      expect(error).toBeNull()
      expect(response.statusCode).toEqual(400)
      expect(response.body).toEqual('Bad URI: bad-uri.com')
      done()
    })
  })
})
