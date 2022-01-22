const path = require('path')
const fs = require('fs')

async function handleUpload (options, parsedURL, req, res) {
  if (typeof options.simulateUploadError === 'function') {
    const error = options.simulateUploadError(parsedURL, req, res)
    if (error) throw error
  }

  const [uploadId, size, firstByte] = parsedURL.pathname.split('/').slice(2)
  const targetPath = path.resolve(options.dataFolder, 'temp_' + uploadId)
  const sizeNum = Number(size)

  const chunkSize = Number(req.headers['content-length'])
  if (!chunkSize && sizeNum) throw Error('content-length required')

  if (!fs.existsSync(targetPath)) fs.writeFileSync(targetPath, Buffer.alloc(0))

  const start = Number(firstByte)
  const writeStream = fs.createWriteStream(targetPath, {
    flags: 'r+',
    start
  })

  req.pipe(writeStream)

  await new Promise((resolve, reject) => {
    req.on('end', resolve)
    req.on('error', reject)
  })

  const uploadStates = options.state.uploadStates
  let uploadState = uploadStates.get(uploadId)
  if (!uploadState) {
    uploadState = []
    uploadStates.set(uploadId, uploadState)
  }

  uploadState = uploadState
    .concat([[start, start + chunkSize]])
    .sort((a, b) => a[0] - b[0])

  let i = 1
  for (; i < uploadState.length; i++) {
    if (uploadState[i - 1][1] === uploadState[i][0]) {
      uploadState[i - 1][1] = uploadState[i][1]
      uploadState.splice(i, 1)
      i--
    }
  }

  const gotEnd = uploadState.length === 1 && uploadState[0][0] === 0 && uploadState[0][1] === sizeNum
  if (gotEnd) {
    uploadStates.delete(uploadId)
    return Buffer.from(uploadId, 'base64')
  } else {
    uploadStates.set(uploadId, uploadState)
  }

  return ''
}

module.exports = handleUpload
