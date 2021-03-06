'use strict'

module.exports = () => {
  // Use dotenv to load local development overrides
  require('dotenv').config()
  return {
    ENVIRONMENT: process.env['ENVIRONMENT'] || 'development',
    GR_API: process.env['GR_API'] || 'https://stage-backend.global-registry.org',
    GR_ACCESS_TOKEN: process.env['GR_ACCESS_TOKEN'] || '',
    CAMPAIGN_SNOWPLOW_S3_BUCKET: process.env['CAMPAIGN_SNOWPLOW_S3_BUCKET'] || 'scale-of-belief-adobe-campaign',
    STORAGE_REDIS_HOST: process.env['STORAGE_REDIS_HOST'] || '',
    STORAGE_REDIS_PORT: process.env['STORAGE_REDIS_PORT'] || '6379',
    STORAGE_REDIS_DB_INDEX: process.env['STORAGE_REDIS_DB_INDEX'] || '0',
    SIEBEL_GR_ACCESS_TOKEN: process.env['SIEBEL_GR_ACCESS_TOKEN'] || 'abc123'
  }
}
