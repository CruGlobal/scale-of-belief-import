'use strict'

module.exports = () => {
  // Use dotenv to load local development overrides
  require('dotenv').config()
  return {
    ENVIRONMENT: process.env['ENVIRONMENT'] || 'development',
    GR_API: process.env['GR_API'] || 'https://stage-backend.global-registry.org',
    GR_ACCESS_TOKEN: process.env['GR_ACCESS_TOKEN'] || '',
    CAMPAIGN_SNOWPLOW_S3_BUCKET: process.env['CAMPAIGN_SNOWPLOW_S3_BUCKET'] || 'scale-of-belief-adobe-campaign',
    REDIS_PORT_6379_TCP_ADDR: process.env['REDIS_PORT_6379_TCP_ADDR'] || '',
    REDIS_PORT_6379_TCP_ADDR_PORT: process.env['REDIS_PORT_6379_TCP_ADDR_PORT'] || '6379',
    SIEBEL_GR_ACCESS_TOKEN: process.env['SIEBEL_GR_ACCESS_TOKEN'] || 'abc123'
  }
}
