'use strict'

module.exports = () => {
  // Use dotenv to load local development overrides
  require('dotenv').config()
  return {
    ENVIRONMENT: process.env['ENVIRONMENT'] || 'development',
    GR_API: process.env['GR_API'] || 'https://stage-backend.global-registry.org',
    GR_ACCESS_TOKEN: process.env['GR_ACCESS_TOKEN'] || ''
  }
}
