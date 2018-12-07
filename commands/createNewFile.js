const { handleCr, getUhFromURL } = require('./util')
const path = require('path')
const util = require('util')
const fs = require('fs')

const rename = util.promisify(fs.rename)
const stat = util.promisify(fs.stat)

async function createNewFile (data, options, url, req, res) {
  const uh = getUhFromURL(url)
  if (!uh) return -1

  const userData = options.state.users.get(uh) || {
    files: [],
    shares: []
  }

  if (data.n.length === 0) {
    console.log('Expecting a file, got none')
    return -1
  }

  const files = []
  for (let input of data.n) {
    const finalHandler = options.generateId()
    const type = Number(input.t) || 0
    const file = {
      h: finalHandler,
      t: type,
      a: input.a,
      k: input.k,
      p: data.t
    }

    file.ts = Math.floor(Date.now() / 1000)
    file.u = uh

    if (type === 0) {
      const tempUploadPath = path.resolve(options.dataFolder, 'temp_' + input.h)
      const targetFilePath = path.resolve(options.dataFolder, 'file_' + finalHandler)

      file.s = (await stat(tempUploadPath)).size
      await rename(tempUploadPath, targetFilePath)
    }

    if (data.cr) await handleCr(data.cr, uh, options)

    userData.files.push(file)
    files.push(file)
  }
  options.state.users.set(uh, userData)

  return { f: files }
}

module.exports = createNewFile
