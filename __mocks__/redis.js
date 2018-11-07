const EventEmitter = require('events');

const LAST_SUCCESS = '2018-07-30T14:28:44.700Z'
const dataStore = { 'scale-of-belief-import-campaign-last-success': LAST_SUCCESS };

class RedisClient extends EventEmitter {
  constructor () {
    super();
    this.connected = true;
  }

  get (key, callback) {
    callback(null, dataStore[key]);
  }

  set (key, value, callback) {
    dataStore[key] = value;
    callback(null, null);
  }

  quit () {
    this.connected = false;
    super.emit('end');
  }
}


module.exports = {
  createClient: (port, address) => {
    return new RedisClient();
  }
}
