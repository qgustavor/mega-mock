const { getUhFromURL } = require('./util')

async function shareFile (data, options, url) {
  const uh = getUhFromURL(url)
  if (!uh) return -1

  const fileShares = options.state.shares
  let shareId
  for (let [id, share] of fileShares) {
    if (share.handler === data.n) {
      shareId = id
      break
    }
  }

  if (!shareId) {
    shareId = options.generateId()
    fileShares.set(shareId, {
      handler: data.n,
      uh
    })
  }

  return shareId
}

module.exports = shareFile
