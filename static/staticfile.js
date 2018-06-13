const StaticFileHandler = require('serverless-aws-static-file-handler')

module.exports.handler = (event, context, callback) => {
  const clientFilesPath = __dirname
  new StaticFileHandler(clientFilesPath).get(event, context)
      .then(response => callback(null, response))
      .catch(err => callback(err))
}