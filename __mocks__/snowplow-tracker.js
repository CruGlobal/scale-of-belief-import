module.exports = {
  emitter: (endpoint, protocol, port, method, bufferSize, callback, agentOptions) => {
    return {
      flush: (mockBody) => {
        callback(null, mockBody, 'ok')
      },
      input: (payload) => {
        console.log('payload:', payload)
      }
    }
  },
  tracker: (emitters, namespace, appId, base64) => {
    return {
      addPayloadPair: jest.fn(),
      trackStructEvent: jest.fn()
    }
  }
}
