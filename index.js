const micro = require('micro')
const url = require('url')

const commands = {
  a: require('./commands/updateAttribute'),
  d: require('./commands/deleteFile'),
  f: require('./commands/listFiles'),
  g: require('./commands/getFileInfo'),
  l: require('./commands/shareFile'),
  p: require('./commands/createNewFile'),
  s2: require('./commands/shareFolder'),
  u: require('./commands/uploadFile'),
  ug: require('./commands/confirmLogin'),
  uq: require('./commands/getAccountInfo'),
  us: require('./commands/handleLogin'),
  us0: require('./commands/preLoginRequest'),
  sml: require('./commands/logout')
}

const handleUpload = require('./commands/handleUpload')
const handleDownload = require('./commands/handleDownload')

const { generateIdCounter } = require('./commands/util')

function createServer (options = {}) {
  // Normalize options
  normalizeOptions(options)

  let handler = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With')

    if (req.method === 'OPTIONS') return null

    const parsedURL = url.parse(req.url, true)
    if (parsedURL.pathname === '/cs') {
      if (req.method !== 'POST') throw Error('only post allowed')
      return handleCs(options, parsedURL, req, res)
    }

    if (parsedURL.pathname.startsWith('/upload')) {
      if (req.method !== 'POST') throw Error('only post allowed')
      return handleUpload(options, parsedURL, req, res)
    }

    if (parsedURL.pathname.startsWith('/download')) {
      return handleDownload(options, parsedURL, req, res)
    }

    micro.send(res, 400, 'Unknown method')
  }

  const server = micro(handler)
  server.state = options.state

  return server
}

function normalizeOptions (options) {
  if (!options.state) options.state = {}
  if (!options.dataFolder) throw Error('dataFolder should be defined')
  if (!options.generateId) options.generateId = generateIdCounter(options.state)

  const state = options.state
  const keys = ['users', 'shares', 'uploadStates', 'loginData']
  for (let key of keys) {
    if (!state[key]) state[key] = new Map()
    if (!(state[key] instanceof Map)) state[key] = new Map(state[key])
  }
}

async function handleCs (options, url, req, res) {
  const postData = await micro.json(req)
  if (!Array.isArray(postData)) throw Error('not an array')

  const results = []
  for (let command of postData) {
    const handler = commands[command.a]
    let result = -1
    try {
      result = await handler(command, options, url, req, res)
    } catch (err) {
      console.error(err)
    }
    results.push(result)
  }

  return results
}

// Export module
module.exports = createServer
