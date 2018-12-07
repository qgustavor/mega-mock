const { getUhFromURL } = require('./util')

async function getAccountInfo (data, options, url) {
  const uh = getUhFromURL(url)
  if (!uh) return -1

  const userData = options.state.users.get(uh) || {
    files: [],
    shares: []
  }

  const spaceUsed = userData.files.reduce((sum, file) => {
    return sum + (file.s || 0)
  }, 0)

  return {
    utype: 0,
    cstrg: spaceUsed,
    mstrg: 50 * 1024 * 1024 * 1024
  }
}

module.exports = getAccountInfo
