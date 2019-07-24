const util = require('./util')

describe('Campaign Util', () => {
  it('Should be defined', () => {
    expect(util).toBeDefined()
  })

  it('Should build a properly formatted date prefix', () => {
    const normalDate = new Date(2018, 6, 30)
    const formattedDate = util.buildFormattedDate(normalDate)

    expect(formattedDate).toBeDefined()
    expect(formattedDate).toEqual('20180730')
  })

  it('Should remove a non-displayable character', () => {
    const original = 'Here is my \ufffdcharacter'
    const processed = util.removeNonDisplayable(original)
    expect(processed).toEqual('Here is my character')
  })

  it('Should return the original when there is no non-displayable character', () => {
    const original = 'Here is my character'
    const processed = util.removeNonDisplayable(original)
    expect(processed).toEqual(original)
  })
})
