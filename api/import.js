module.exports.handler = (event, context, callback) => {
  if(event.httpMethod !== 'POST'){
    callback(null, { statusCode: 405 });
    return;
  }

  const gr = require('./gr.js');
  const snowplow = require('./snowplow.js');
  const Batch = require('batch'), batch = new Batch;
  batch.concurrency(4);

  const inputData = JSON.parse(event.body);
  inputData.forEach((user) => {
    if(!user.score || !user.email){
      return;
    }

    batch.push((done) => {

      gr.createEntity(user, (person) => {

        if(person){
          let masterPersonId = person['master_person:relationship']['master_person'];
          snowplow.track(user.score, masterPersonId);
        }

        done();
      });
    });
  });

  batch.end(() => {
    snowplow.flush();

    callback(null, { statusCode: 204 });
  });
};
