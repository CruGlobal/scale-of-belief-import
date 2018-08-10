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
});