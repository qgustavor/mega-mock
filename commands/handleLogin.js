async function handleLogin (data, options) {
  const loginData = options.state.loginData.get(data.uh)
  if (!loginData) return -9

  return loginData
}

module.exports = handleLogin
