function generateIdCounter (state) {
  if (state.idCounter == null) state.idCounter = 0

  return function () {
    const buffer = Buffer.alloc(5)
    buffer.writeUIntBE(state.idCounter, 0, 5)
    state.idCounter++

    return base32(buffer)
  }
}

// It uses base32 to generate IDs as Windows file system is not case sensitive
function base32 (plain) {
  const charTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let shiftIndex = 0
  let digit = 0
  let encoded = ''

  for (let i = 0; i < plain.length;) {
    let current = plain[i]

    if (shiftIndex > 3) {
      digit = current & (0xff >> shiftIndex)
      shiftIndex = (shiftIndex + 5) % 8
      digit = (digit << shiftIndex) | (
        (i + 1 < plain.length) ? plain[i + 1] : 0
      ) >> (8 - shiftIndex)
      i++
    } else {
      digit = (current >> (8 - (shiftIndex + 5))) & 0x1f
      shiftIndex = (shiftIndex + 5) % 8
      if (shiftIndex === 0) i++
    }

    encoded += charTable[digit]
  }

  return encoded
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
