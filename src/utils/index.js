// 👉 IsEmpty
export const isEmpty = value => {
  if (value === null || value === undefined || value === '')
    return true
  
  return !!(Array.isArray(value) && value.length === 0)
}

// 👉 IsNullOrUndefined
export const isNullOrUndefined = value => {
  return value === null || value === undefined
}

// 👉 IsEmptyArray
export const isEmptyArray = arr => {
  return Array.isArray(arr) && arr.length === 0
}

// 👉 IsObject
export const isObject = obj => obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)
export const isToday = date => {
  const today = new Date()
  
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
  /* eslint-enable */
  )
}

// 👉 isValidDate
export const isValidDate = dateString => {
  var regEx = /^\d{4}-\d{2}-\d{2}$/
  if(!dateString.match(regEx)) return false  // Invalid format
  var d = new Date(dateString)
  var dNum = d.getTime()
  if(!dNum && dNum !== 0) return false // NaN value, Invalid date
  
  return d.toISOString().slice(0,10) === dateString
}


/**
 *  👉 Rellena un string hasta una longitud determinada con otro string
 *
 * @param {String} input
 * @param {Number} padLength
 * @param {String} padString
 * @param {Boolean} padLeft
 * @returns
 */
export const strPad = (input, padLength, padString = '0', padLeft = true) => {
  const stringInput = input.toString()
  const length = padLength - stringInput.length
  let stringBuilder = ''
  for (let i = 0; i < length; i += 1) {
    stringBuilder = stringBuilder.concat(padString)
  }
  
  return padLeft ? stringBuilder.concat(stringInput) : stringInput.concat(stringBuilder)
}

export const downloadBlob = (blob, filename, typeName) => {
  const urlObject = window.URL.createObjectURL(new Blob([blob], { type: typeName }))
  const link = document.createElement('a')

  link.href = urlObject
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()

  // remove element and urlobject
  link.remove()
  window.URL.revokeObjectURL(urlObject)
}

export const openTabBlob = (blob, filename, typeName) => {
  const urlObject = window.URL.createObjectURL(new Blob([blob], { type: typeName }))
  
  window.open(urlObject, filename)
}
