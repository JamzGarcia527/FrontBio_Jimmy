import { isEmpty, isEmptyArray, isNullOrUndefined, isValidDate } from '@/utils/index'
import { helpers } from '@vuelidate/validators'

// 👉 Required Validator
export const requiredVuelidate = helpers.withMessage('Este campo es requerido', value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false )
    return false
  
  return String(value).trim().length > 0
})

export const requiredIfVuelidate = (condition, message = 'Este campo es requerido') => helpers.withMessage(message, value => {
  if (!condition.value) return true

  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return false
  
  return String(value).trim().length > 0
})

// 👉 Required Validator
export const requiredSelectVuelidate = helpers.withMessage('Este campo es requerido', value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return false
  
  return Number(value) !== -1
})

// 👉 Integer Validator
export const integerVuelidate = helpers.withMessage('El valor del campo debe ser númerico.', value => {
  if (isEmpty(value))
    return true
  if (Array.isArray(value))
    return value.every(val => /^-?[0-9]+$/.test(String(val))) 
  
  return /^-?[0-9]+$/.test(String(value))
})


// 👉 Email Validator
export const emailVuelidate = helpers.withMessage('Debe ingresar un correo electrónico valido.', value => {
  if (isEmpty(value))
    return true
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (Array.isArray(value))
    return value.every(val => re.test(String(val)))
  
  return re.test(String(value))
})

// 👉 DateFormat Validator
export const dateFormatVuelidate = helpers.withMessage("Formato de fecha invalido", value => isValidDate(value))

// 👉 Max length validator
export const maxLengthVuelidate = maxChars => helpers.withMessage(`El campo no debe tener más de ${maxChars} caracteres.`, value => {
  if (isEmpty(value))
    return true
  if (Array.isArray(value))
    return value.every(val => String(val).length <= maxChars) 
  
  return String(value).length <= maxChars
})

export const nonNegativeValidator = helpers.withMessage('El valor debe ser mayor que 0.', value => {
  return !(value <= 0)
})


