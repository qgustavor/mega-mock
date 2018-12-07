const preloadedUsers = require('./preloaded-users.json')
const megamock = require('..')
const path = require('path')
const util = require('util')
const fs = require('fs')

const checkAccess = util.promisify(fs.access)
const readFile = util.promisify(fs.readFile)
const mkdir = util.promisify(fs.mkdir)

// TODO: allow changing the following values
const serverDataFolder = path.resolve(process.cwd(), 'mega-data')
const serverDataPath = path.resolve(serverDataFolder, 'state.json')
const serverPort = 3000

prepareServer().catch(err => {
  console.error(err)
  process.exit(1)
})

async function prepareServer () {
  await checkAccess(serverDataFolder).catch(err => {
    if (err.code !== 'ENOENT') throw err
    return mkdir(serverDataFolder)
  })

  const state = await getCachedState()
  startServer(state)
}

async function getCachedState () {
  const data = await readFile(serverDataPath, 'utf-8').catch(err => {
    if (err.code !== 'ENOENT') throw err
  })
  return data && JSON.parse(data)
}

function startServer (state) {
  const server = megamock({
    dataFolder: serverDataFolder,
    state
  })

  // Populate loginData with preloaded user data
  for (let [user, data] of Object.entries(preloadedUsers)) {
    server.state.loginData.set(user, data)
  }

  server.listen(serverPort, '0.0.0.0', () => {
    console.log('Server started: set up MEGA gateway to http://127.0.0.1:' + serverPort)
  })

  handleExit(server)
}

function handleExit (server) {
  process.once('SIGINT', () => {
    console.log('Stopping server')

    const data = JSON.stringify(server.state, (key, value) => {
      // Serialize Maps using Array.from
      // createServer code already casts those back to Maps
      return value instanceof Map ? Array.from(value) : value
    })

    fs.writeFile(serverDataPath, data, (err) => {
      if (err) throw err
      process.exit()
    })
  })
}
