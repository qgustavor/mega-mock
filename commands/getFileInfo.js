const url = require('url')

function getFileInfo (data, options, parsedURL, req) {
  let file

  if (data.n) {
    // Got file handler
    for (let [uh, userData] of options.state.users) {
      file = userData.files.find(e => e.h === data.n)
      if (file) break
    }
  } else if (data.p) {
    // Got share handler
    const share = options.state.shares.get(data.p)
    if (!share) return -9
    file = options.state.users.get(share.uh).files.find(e => e.h === share.handler)
  } else {
    return -1
  }

  if (!file) return -9

  const baseURL = 'http://' + req.headers['host']
  const downloadURL = url.resolve(baseURL, '/download/' + file.h)

  return {
    g: downloadURL,
    s: file.s,
    at: file.a
  }
}

module.exports = getFileInfo
