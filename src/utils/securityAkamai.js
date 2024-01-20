/*const securityAkamai = () => {
  const randomString = len => {
    const length = Number(len) || 8
    const string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let r = ''
    for (let i = 0; i < length; i += 1) {
      const index = string[Math.floor(Math.random() * string.length)]

      r = r.concat(index)
    }
    
    return r
  }

  const cookieExist = key => (document.cookie.split(';').some(e => e.trim().startsWith(`${key}=`)))

  const cookieCreate = (key, value, overwrite = false) => {
    const exist = cookieExist(key)
    if (!exist || overwrite) {
      const val = typeof value === 'object' ? JSON.stringify(value) : value

      document.cookie = `${key}=${val}; SameSite=none; Secure`
    }
  }

  const cookie = 'procesoselectorales'
  const uid = randomString(16)

  cookieCreate(cookie, `idcan_${uid};secure`)
}

securityAkamai()
*/