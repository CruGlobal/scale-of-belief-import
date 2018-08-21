const LAST_SUCCESS = '2018-07-30T14:28:44.700Z'
const dataStore = { 'scale-of-belief-import-campaign-last-success': LAST_SUCCESS };

module.exports = {
  createClient: (port, address) => {
    return {
      on: (type, callback) => {
        callback();
      },
      get: (key) => {
        return dataStore[key];
      },
      set: (key, value) => {
        dataStore[key] = value;
      }
    };
  }
}