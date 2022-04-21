const buildFormattedDate = (date) => {
  return date.getUTCFullYear() +
    getZeroPaddedValue(date.getUTCMonth() + 1) +
    getZeroPaddedValue(date.getUTCDate())
}

const getZeroPaddedValue = (original) => {
  return ('0' + original).slice(-2)
}

const hasNonDisplayableCharacter = (original) => {
  if (original.indexOf('\ufffd') !== -1) {
    return true
  }
  return false
}

const removeNonDisplayable = (original) => {
  if (hasNonDisplayableCharacter(original)) {
    return original.replace(/\ufffd/g, '')
  }
  return original
}

module.exports = {
  buildFormattedDate,
  removeNonDisplayable
}
