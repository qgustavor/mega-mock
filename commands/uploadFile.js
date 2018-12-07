// Expected input
// { a: "u", ssl: 0, s: 123456, ms: 0, r: 0, e: 0, v: 2}

function uploadFile (data, options, url, req) {
  return {
    p: `http://${req.headers.host}/upload/${options.generateId()}/${data.s}`
  }
}

module.exports = uploadFile
