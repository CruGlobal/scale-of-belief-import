const snowplow = require('snowplow-tracker');
const campaignSnowplow = require('./snowplow');

describe('Campaign Snowplow', () => {
  it('Should be defined', () => {
    expect(campaignSnowplow).toBeDefined();
  });

  const idSchema = 'iglu:org.cru/ids/jsonschema/1-0-3';
  const scoreSchema = 'iglu:org.cru/content-scoring/jsonschema/1-0-0';

  it('Should track an open event with an external campaign code', () => {
    const mockEmitter = {
      flush: () => {}
    };
    jest.spyOn(snowplow, 'emitter').mockImplementation(() => mockEmitter);

    const mockTrackStructEvent = jest.fn();
    const mockAddPayloadPair = jest.fn();

    const mockTracker = {
      addPayloadPair: mockAddPayloadPair,
      trackStructEvent: mockTrackStructEvent
    }
    const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker);

    const data = {
      job_id: 'some-id',
      ext_campaign_code: 'campaign-code',
      delivery_label: 'Some Label',
      adobe_campaign_label: 'Campaign Label',
      gr_master_person_id: 'some-gr-id',
      log_date: '2018/07/30 09:20:49'
    };

    campaignSnowplow.trackOpen(data);
    expect(trackerSpy).toHaveBeenCalled();

    const uri = 'campaign://open-email/some-id/campaign-code';

    const customContexts = [
      {
        schema: idSchema,
        data: { gr_master_person_id: 'some-gr-id' }
      },
      {
        schema: scoreSchema,
        data: {
          uri: uri
        }
      }
    ];

    expect(mockTrackStructEvent).toHaveBeenCalledWith(
      'campaign',
      'open-email',
      'Some Label',
      'Campaign Label',
      'campaign-code',
      customContexts,
      data['log_date']);

    expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri);
    expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some%20Label');
  });

  it('Should track an open event without an external campaign code', () => {
      const mockEmitter = {
        flush: () => {}
      };
      jest.spyOn(snowplow, 'emitter').mockImplementation(() => mockEmitter);

      const mockTrackStructEvent = jest.fn();
      const mockAddPayloadPair = jest.fn();

      const mockTracker = {
        addPayloadPair: mockAddPayloadPair,
        trackStructEvent: mockTrackStructEvent
      }
      const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker);

      const data = {
        job_id: 'some-id',
        delivery_label: 'Some Label',
        adobe_campaign_label: 'Campaign Label',
        gr_master_person_id: 'some-gr-id',
        log_date: '2018/07/30 09:20:49'
      };

      campaignSnowplow.trackOpen(data);
      expect(trackerSpy).toHaveBeenCalled();

      const uri = 'campaign://open-email/some-id';

      const customContexts = [
        {
          schema: idSchema,
          data: { gr_master_person_id: 'some-gr-id' }
        },
        {
          schema: scoreSchema,
          data: {
            uri: uri
          }
        }
      ];

      expect(mockTrackStructEvent).toHaveBeenCalledWith(
        'campaign',
        'open-email',
        'Some Label',
        'Campaign Label',
        null,
        customContexts,
        data['log_date']);

      expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri);
      expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some%20Label');
    });

    it('Should track an open event with an sso guid', () => {
      const mockEmitter = {
        flush: () => {}
      };
      jest.spyOn(snowplow, 'emitter').mockImplementation(() => mockEmitter);

      const mockTrackStructEvent = jest.fn();
      const mockAddPayloadPair = jest.fn();

      const mockTracker = {
        addPayloadPair: mockAddPayloadPair,
        trackStructEvent: mockTrackStructEvent
      }
      const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker);

      const data = {
        job_id: 'some-id',
        delivery_label: 'Some Label',
        adobe_campaign_label: 'Campaign Label',
        sso_guid: 'some-guid',
        gr_master_person_id: 'some-gr-id',
        log_date: '2018/07/30 09:20:49'
      };

      campaignSnowplow.trackOpen(data);
      expect(trackerSpy).toHaveBeenCalled();

      const uri = 'campaign://open-email/some-id';

      const customContexts = [
        {
          schema: idSchema,
          data: { gr_master_person_id: 'some-gr-id', sso_guid: 'some-guid' }
        },
        {
          schema: scoreSchema,
          data: {
            uri: uri
          }
        }
      ];

      expect(mockTrackStructEvent).toHaveBeenCalledWith(
        'campaign',
        'open-email',
        'Some Label',
        'Campaign Label',
        null,
        customContexts,
        data['log_date']);

      expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri);
      expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some%20Label');
    });

    it('Should track a click event with an external campaign code and sso guid', () => {
      const mockEmitter = {
        flush: () => {}
      };
      jest.spyOn(snowplow, 'emitter').mockImplementation(() => mockEmitter);

      const mockTrackStructEvent = jest.fn();
      const mockAddPayloadPair = jest.fn();

      const mockTracker = {
        addPayloadPair: mockAddPayloadPair,
        trackStructEvent: mockTrackStructEvent
      }
      const trackerSpy = jest.spyOn(snowplow, 'tracker').mockImplementation(() => mockTracker);

      const data = {
        job_id: 'some-id',
        ext_campaign_code: 'campaign-code',
        delivery_label: 'Some Label',
        adobe_campaign_label: 'Campaign Label',
        sso_guid: 'some-guid',
        gr_master_person_id: 'some-gr-id',
        log_date: '2018/07/30 09:20:49'
      };

      campaignSnowplow.trackClick(data);
      expect(trackerSpy).toHaveBeenCalled();

      const uri = 'campaign://click-link/some-id/campaign-code';

      const customContexts = [
        {
          schema: idSchema,
          data: { gr_master_person_id: 'some-gr-id', sso_guid: 'some-guid' }
        },
        {
          schema: scoreSchema,
          data: {
            uri: uri
          }
        }
      ];

      expect(mockTrackStructEvent).toHaveBeenCalledWith(
        'campaign',
        'click-link',
        'Some Label',
        'Campaign Label',
        'campaign-code',
        customContexts,
        data['log_date']);

      expect(mockAddPayloadPair).toHaveBeenCalledWith('url', uri);
      expect(mockAddPayloadPair).toHaveBeenCalledWith('page', 'Some%20Label');
    });
});
