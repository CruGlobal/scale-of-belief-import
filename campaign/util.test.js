const util = require('./util');

describe('Campaign Util', () => {
  it('Should be defined', () => {
    expect(util).toBeDefined();
  });

  it('Should build a properly formatted date prefix', () => {
    let normalDate = new Date(2018, 6, 30);
    let formattedDate = util.buildFormattedDate(normalDate);

    expect(formattedDate).toBeDefined();
    expect(formattedDate).toEqual('20180730');
  });

  it('Should group data by master person id', () => {
    const data = [
      {
        gr_master_person_id: 'some-gr-id',
        sso_guid: 'some-guid'
      },
      {
        gr_master_person_id: 'some-gr-id',
        sso_guid: 'other-guid'
      },
      {
        gr_master_person_id: 'other-gr-id',
        sso_guid: 'third-guid'
      }
    ];

    const groupedData = util.groupBy(data, 'gr_master_person_id');
    expect(groupedData).toBeDefined();
    expect(groupedData['some-gr-id'].length).toEqual(2);
    expect(groupedData['other-gr-id'].length).toEqual(1);
    expect(groupedData['other-gr-id'][0]['sso_guid']).toEqual('third-guid');
  });
});