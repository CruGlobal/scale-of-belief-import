const StaticFileHandler = require('serverless-aws-static-file-handler')

const clientFilesPath = __dirname
const fileHandler = new StaticFileHandler(clientFilesPath)

module.exports.handler = async (event, context) => {
  return fileHandler.get(event, context)
}
