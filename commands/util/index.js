let counter = 0
function generateIdCounter () {
  const buffer = Buffer.alloc(6)
  buffer.writeUIntBE(counter++, 0, 6)
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

exports.generateIdCounter = generateIdCounter

async function handleCr (cr, uh, options) {
  const fileShares = options.state.shares

  const [shares, sources, mapping] = cr
  for (let shIndex = 0; shIndex < shares.length; shIndex++) {
    const shareId = options.generateId()
    const handler = shares[shIndex]
    const keys = {}
    for (let i = 0; i < mapping.length; i += 3) {
      if (mapping[i] === shIndex) {
        const source = sources[mapping[i + 1]]
        keys[source] = mapping[i + 2]
      }
    }
    let share = fileShares.get(shareId)
    if (!share) {
      share = {
        keys: {},
        handler,
        uh
      }
    }
    Object.assign(share, keys)
    fileShares.set(shareId, share)
  }
}

exports.handleCr = handleCr

function getUhFromURL (url) {
  const sid = url.query.sid
  if (!sid || !sid.includes('_megamock')) return
  return sid.replace(/_megamock.*$/, '')
}

exports.getUhFromURL = getUhFromURL
