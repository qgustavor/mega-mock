const { handleCr, getUhFromURL } = require('./util')

async function shareFolder (data, options, url) {
  const uh = getUhFromURL(url)
  if (!uh) return -1

  const userData = options.state.users.get(uh)

  userData.shares.push({
    h: data.n,
    ha: data.ha,
    k: data.ok
  })

  await handleCr(data.cr, uh, options)
  options.state.users.set(uh, userData)

  return ''
}

module.exports = shareFolder
