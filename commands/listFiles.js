const { getUhFromURL } = require('./util')

async function listFiles (data, options, url) {
  if (url.query.n) return listSharedFolder(data, options, url)

  const uh = getUhFromURL(url)
  if (!uh) return -1

  const files = []

  // Populate default files
  const timestamp = Math.floor(Date.now() / 1000)
  for (let i = 2; i <= 4; i++) {
    files.push({
      h: 'handler' + i,
      p: '', // parent
      u: uh, // user handler
      t: i, // type
      a: '', // attributes
      ts: timestamp
    })
  }

  const userData = options.state.users.get(uh) || {
    files: [],
    shares: []
  }

  for (let file of userData.files) files.push(file)
  const shares = userData.shares

  return {
    f: files,
    ok: shares
  }
}

async function listSharedFolder (data, options, url) {
  const shareId = url.query.n
  const fileShares = options.state.shares
  const share = fileShares.get(shareId)
  if (!share) return -9

  const userState = options.state.users.get(share.uh)
  const files = {}
  const parents = {}

  for (let file of userState.files) {
    files[file.h] = file
    if (!parents[file.p]) parents[file.p] = []
    parents[file.p].push(file.h)
  }

  const fileList = getFileList(share.handler, files, parents)
  return { f: fileList }
}

function getFileList (handler, files, parents) {
  let list = [files[handler]]
  const children = parents[handler] || []
  for (let child of children) {
    list = list.concat(getFileList(child, files, parents))
  }
  return list
}

module.exports = listFiles
