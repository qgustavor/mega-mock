const { getUhFromURL } = require('./util')

function confirmLogin (data, options, url) {
  const uh = getUhFromURL(url)
  if (!uh) return -1

  return {
    u: uh,
    name: 'Test User'
  }
}

module.exports = confirmLogin
