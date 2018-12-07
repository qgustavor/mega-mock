const { getUhFromURL } = require('./util')

async function updateAttribute (data, options, url) {
  const uh = getUhFromURL(url)
  if (!uh) return -1

  const userData = options.state.users.get(uh) || {
    files: [],
    shares: []
  }

  const file = userData.files.find(e => e.h === data.n)
  if (!file) return -1
  file.a = data.at

  options.state.users.set(uh, userData)

  return {}
}

module.exports = updateAttribute
