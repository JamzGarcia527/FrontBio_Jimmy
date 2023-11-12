import { isEmpty, isEmptyArray, isNullOrUndefined } from '@/utils/index'

// 👉 Required Validator
export const requiredValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'Este campo es requerido'
  
  return !!String(value).trim().length || 'Este campo es requerido'
}

// 👉 Required Validator
export const requiredEspecialSelectValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'Este campo es requerido'

  return Number(value) !== -1 || 'Este campo es requerido'
}

// 👉 Email Validator
export const emailValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || 'Debe ingregar un correo electrónico valido'
  
  return re.test(String(value)) || 'Debe ingregar un correo electrónico valido'
}

// 👉 Password Validator
export const passwordValidator = password => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/
  const validPassword = regExp.test(password)
  
  return (
    // eslint-disable-next-line operator-linebreak
    validPassword ||
        'Field must contain at least one uppercase, lowercase, special character and digit with min 8 chars')
}

// 👉 Confirm Password Validator
export const confirmedValidator = (value, target) => value === target || 'The Confirm Password field confirmation does not match'

export const confirmedEmail =  target => value =>  value === target.value || 'El correo electronico no es el mismo.'


// 👉 Between Validator
export const betweenValidator = (value, min, max) => {
  const valueAsNumber = Number(value)
  
  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || `Enter number between ${min} and ${max}`
}

// 👉 Integer Validator
export const integerValidator = value => {
  if (isEmpty(value))
    return true
  if (Array.isArray(value))
    return value.every(val => /^-?[0-9]+$/.test(String(val))) || 'El valor de este campo debe ser númerico'
  
  return /^-?[0-9]+$/.test(String(value)) || 'El valor de este campo debe ser númerico'
}

// 👉 Regex Validator
export const regexValidator = (value, regex) => {
  if (isEmpty(value))
    return true
  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)
  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))
  
  return regeX.test(String(value)) || 'The Regex field format is invalid'
}

// 👉 Alpha Validator
export const alphaValidator = value => {
  if (isEmpty(value))
    return true
  
  return /^[A-Z]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters'
}

// 👉 URL Validator
export const urlValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/
  
  return re.test(String(value)) || 'URL is invalid'
}

// 👉 Length Validator
export const lengthDigitValidator = length => value => {
  if (isEmpty(value))
    return true
  
  return String(value).length === length 
    || `Debe contener ${length} digitos`
}

// 👉 MaxLength Validator
export const maxLengthValidator = length => value => {
  if (isEmpty(value))
    return true

  return String(value).length <= length 
    || `Máximo ${length} caracteres`
}

export const dateValidator = value => {
  if (isEmpty(value))
    return true

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/

  if (!dateRegex.test(value))
    return "Formato de fecha inválido"

  const currentDate = new Date().toISOString().slice(0, 10)

  if (value > currentDate)
    return "La fecha no puede ser mayor a la actual"

  const minDate = '1900-01-01'

  if (value < minDate)
    return "La fecha no puede ser menor a 1900"

  return true
}



// 👉 Alpha-dash Validator
export const alphaDashValidator = value => {
  if (isEmpty(value))
    return true
  const valueAsString = String(value)
  
  return /^[0-9A-Z_-]*$/i.test(valueAsString) || 'All Character are not valid'
}
