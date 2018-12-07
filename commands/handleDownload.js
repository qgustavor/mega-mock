const micro = require('micro')
const path = require('path')
const fs = require('fs')

async function handleDownload (options, parsedURL, req, res) {
  if (typeof options.simulateDownloadError === 'function') {
    const error = options.simulateDownloadError(parsedURL, req, res)
    if (error) return error
  }

  const [handler, range = ''] = parsedURL.pathname.split('/').slice(2)
  const [start = 0, end = Infinity] = range.split('-').map(Number)
  const targetFilePath = path.resolve(options.dataFolder, 'file_' + handler)

  const stream = fs.createReadStream(targetFilePath, { start, end })
  stream.once('error', error => {
    micro.sendError(req, res, error)
  })
  stream.once('readable', () => {
    micro.send(res, 200, stream)
  })
}

module.exports = handleDownload
