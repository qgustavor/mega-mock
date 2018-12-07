const { getUhFromURL } = require('./util')
const util = require('util')
const path = require('path')
const fs = require('fs')

const unlink = util.promisify(fs.unlink)

async function deleteFile (data, options, url) {
  const uh = getUhFromURL(url)
  if (!uh) return -1

  const userData = options.state.users.get(uh) || {
    files: [],
    shares: []
  }

  const fileIndex = userData.files.findIndex(e => e.h === data.n)
  if (fileIndex === -1) return -1
  userData.files.splice(fileIndex, 1)

  const filePath = path.resolve(options.dataFolder, 'file_' + data.n)
  await unlink(filePath)

  options.state.users.set(uh, userData)

  return {}
}

module.exports = deleteFile
