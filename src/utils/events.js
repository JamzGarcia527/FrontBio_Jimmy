/** 
 * Solo permite escribir numeros
 * 
 * @param {*} event 
 */
export const keyPressOnlyNumber = event => {
  const e = event || window.event

  if (isNaN(e.key)) {
    e.preventDefault()
  } else {
    return true
  }
}

export const pasteOnlyNumber = e => {
  const clipboardData = e.clipboardData || window.clipboardData
  const pastedData = clipboardData.getData('Text')

  const expect = e.target.value.toString() + pastedData

  if (!/^[-+]?[0-9]*\.?[0-9]*$/.test(expect)) {
    e.preventDefault()
  } else {
    return true
  }
}
