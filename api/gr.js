const request = require('request')
const has = require('lodash/has')

const grBase = process.env.GR_API
const grAccessToken = process.env.GR_ACCESS_TOKEN

const findEntitiesByEmail = (user, callback) => {
  return request.get({
    url: grBase + '/entities',
    qs: {
      entity_type: 'person',
      'filters[email_address][email]': user.email,
      'filters[owned_by]': 'all',
      fields: 'master_person:relationship',
      per_page: 1
    },
    json: true,
    headers: {
      Authorization: 'Bearer ' + grAccessToken
    }
  }, (e, r, body) => {
    if (e) { return false }

    const person = body.entities.length ? body.entities[0].person : false
    if (callback) {
      callback(person)
    }
  })
}

const createEntity = (user, callback) => {
  return request.post({
    url: grBase + '/entities',
    qs: {
      full_response: 'true',
      require_mdm: 'true',
      fields: 'master_person:relationship'
    },
    json: {
      entity: {
        person: {
          client_integration_id: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          email_address: {
            client_integration_id: user.email,
            email: user.email
          }
        }
      }
    },
    headers: {
      Authorization: 'Bearer ' + grAccessToken
    }
  }, (e, r, body) => {
    if (e || r.statusCode >= 400) {
      callback(false) // eslint-disable-line
      return
    }

    const person = body.entity ? body.entity.person : false
    if (callback) {
      callback(person)
    }
  })
}

const findMasterPersonId = (personId, accessToken = grAccessToken) => {
  return new Promise((resolve, reject) => {
    request.get({
      url: `${grBase}/entities/${personId}`,
      qs: {
        fields: 'master_person:relationship'
      },
      json: true,
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    }, (e, r, body) => {
      if (e) { reject(e) } else if (has(body, ['entity', 'person', 'master_person:relationship', 'master_person'])) {
        resolve(body.entity.person['master_person:relationship'].master_person)
      } else {
        reject(new Error(`Person missing master_person id: ${personId}`))
      }
    })
  })
}

module.exports = {
  findEntitiesByEmail: findEntitiesByEmail,
  createEntity: createEntity,
  findOrCreateId: (user, callback) => {
    if (!user.email) { return false }

    findEntitiesByEmail(user, (person) => {
      if (person) {
        callback(person)
      } else {
        createEntity(user, callback)
      }
    })
  },
  findMasterPersonId: findMasterPersonId
}
