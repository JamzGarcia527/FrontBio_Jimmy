
<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import {
  requiredValidator,
} from '@/utils/validators'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import imageLogo from '@images/pages/fondoContrasena.png'
import { useUserConfigStore } from '@/stores/userconfig'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const refVForm = ref()
const show1 = ref(false)
const show2 = ref(false)
const verContraseña = ref(false)
const contraseñaTemporal = ref('')
const  classCountCharacters = ref('')
const  classLowerCase = ref('')
const  passwordIcon = ref('')
const  esMinuscula = ref('')
const  esMinusculaIcon = ref('')
const  esMayuscula = ref('')
const  esMayusculaIcon = ref('')
const  classCapitalLetter = ref('')
const  numeros = ref('')
const  classNumber = ref('')
const  numerosIcon = ref('')
const  confirmPassword = ref('')
const  classSamePasswords = ref('')
const  confirmPasswordIcon = ref('')
const  password = ref('')


const sendData = async () => {
  try {
    const requestBody = {
      prev_password: contraseñaTemporal.value,
      new_password: password.value,
    }

    const { data }  = await axios.post('/auth/changepassword', requestBody)

    await Swal.fire({ text: data, icon: "success" })
    location.reload()

  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
  }
}


const inputPassword = evento => {
  const password =  evento.target.value
  const  esMinuscula= /[a-z]/.test(password)
  const  esMayuscula = /[A-Z]/.test(password)
  const  numeros = /[0-9]/.test(password)
 
  countCharacters(password)
  lowerCase(esMinuscula)
  capitalLetter(esMayuscula)
  number(numeros)

  if(!password == '' || !confirmPassword.value =='' ){
    samePasswords(confirmPassword.value,password)
  }
}

const inputPassworConfirm = evento => {
  const  confirmPassword = evento.target.value
  if(!password.value == '' || !confirmPassword =='' ){
    samePasswords(confirmPassword,password.value)
  }
}

const countCharacters=password=> {
  if(password.length >= 8){
    classCountCharacters.value= 'text-success'
    passwordIcon.value = 'iconSuccess'
  }else{
    classCountCharacters.value= 'text-warning'
    passwordIcon.value = 'iconError'
  }
}

const lowerCase=esMinuscula=> {
  if(esMinuscula){
    classLowerCase.value= 'text-success'
    esMinusculaIcon.value = 'iconSuccess'
  }else{
    classLowerCase.value= 'text-warning'
    esMinusculaIcon.value = 'iconError'
  }
}

const capitalLetter=esMayuscula=> {
  
  if(esMayuscula){
    classCapitalLetter.value= 'text-success'
    esMayusculaIcon.value = 'iconSuccess'
    
  }else{
    classCapitalLetter.value= 'text-warning'
    esMayusculaIcon.value = 'iconError'
  }
}

const number= numeros => {
 
  if(numeros){
    classNumber.value = 'text-success'
    numerosIcon.value = 'iconSuccess'
  }else{
    classNumber.value = 'text-warning'
    numerosIcon.value = 'iconError'
  }
}

const samePasswords= (confirmPassword,password) => {

  if(confirmPassword == password){
    classSamePasswords.value = 'text-success'
    confirmPasswordIcon.value = 'iconSuccess'
  }else{
    classSamePasswords.value = 'text-warning'
    confirmPasswordIcon.value  = 'iconError' 
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid && numerosIcon.value== 'iconSuccess' && esMayusculaIcon.value == 'iconSuccess' && passwordIcon.value=='iconSuccess' && esMinusculaIcon.value == 'iconSuccess' && confirmPassword.value == password.value){
      sendData()
    }
    if(numerosIcon.value==''){
      classNumber.value = 'text-warning'
      numerosIcon.value = 'iconError'
      
    }

    if(esMayusculaIcon.value==''){
      classCapitalLetter.value= 'text-warning'
      esMayusculaIcon.value = 'iconError'
    }

    if(esMinusculaIcon.value==''){
      classLowerCase.value= 'text-warning'
      esMinusculaIcon.value = 'iconError'
    }

    if(password.value.length <= 7){
      classCountCharacters.value= 'text-warning'
      passwordIcon.value = 'iconError'
    }
    if(confirmPassword.value == '' ||password.value ==''){
      classSamePasswords.value = 'text-warning'
      confirmPasswordIcon.value  = 'iconError'
    }
        
  })
}
</script>

<template>
  <VCard title="Contraseña anterior">
    <hr>
      
    <VForm 
      ref="refVForm"
      class="mt-5"
      @submit.prevent="onSubmit"
    >     
      <VRow>
        <VCol
          cols="12"
        >
          <VCol
            cols="6"
          >
            <p class=" text-subtitle-2 ml-3">
              Ingresar la contraseña actual:
            </p>
          </VCol> 
          <VCol
            cols="6"
          >
            <VTextField
              v-model="contraseñaTemporal"
              :append-inner-icon="verContraseña ? 'tabler-eye' : 'tabler-eye-off'"
              :type="verContraseña ? 'text' : 'password'"
              :rules="[requiredValidator]"
              :label="t('auth.current_password')"
              @click:append-inner="verContraseña = !verContraseña"
            />
          </VCol> 
          <VCol
            cols="12"
          >
            <VCardTitle class="">
              Establecer nueva contraseña 
            </VCardTitle>
            <hr>
          </VCol>
        </VCol>
        <VCol
          cols="6"
        >
          <VCol
            cols="12"
          >
            <VTextField
              v-model="password"
              :append-inner-icon="show1 ? 'tabler-eye' : 'tabler-eye-off'"
              :rules="[requiredValidator]"
              :type="show1 ? 'text' : 'password'"
              :label="t('auth.new_password')"
              @click:append-inner="show1 = !show1"
              @input="inputPassword"
            />
          </VCol>
          <VCol
            cols="12"
            class=""
          >
            <VTextField
              v-model="confirmPassword"
              :append-inner-icon="show2 ? 'tabler-eye' : 'tabler-eye-off'"
              :rules="[requiredValidator]"
              :type="show2 ? 'text' : 'password'"
              :label="t('auth.repeat_new_Password')"
              @click:append-inner="show2 = !show2"
              @input="inputPassworConfirm"
            />
          </VCol>
        </VCol>
        <VCol
          cols="6"
          class=""
        >
          <p class=" text-subtitle-2">
            Ahora asigne su nueva contraseña con los siguientes parámetros:
          </p>
          <div class="row">
            <p
              class="text-subtitle-2 mb-0 ml-3"
              :class="classCountCharacters"
            >
              <VIcon
                v-if="passwordIcon =='iconSuccess'"
                icon="mdi-checkbox-marked-circle"
              />
              <VIcon
                v-if="passwordIcon =='iconError'"
                icon="mdi-alpha-x-circle"
              />
              Deberá tener 8 caracteres como mínimo
            </p>
            <p
              :class="classLowerCase"
              class="text-subtitle-2 mb-0 ml-3"
            >
              <VIcon
                v-if="esMinusculaIcon == 'iconSuccess'"
                icon="mdi-checkbox-marked-circle"
              />
              <VIcon
                v-if="esMinusculaIcon == 'iconError'"
                icon="mdi-alpha-x-circle"
              />
              Al menos debería tener una letra Minúscula
            </p>
            <p
              :class="classCapitalLetter" 
              class="text-subtitle-2 mb-0 ml-3"
            >
              <VIcon
                v-if="esMayusculaIcon == 'iconSuccess'"
                icon="mdi-checkbox-marked-circle"
              />
              <VIcon
                v-if="esMayusculaIcon == 'iconError'"
                icon="mdi-alpha-x-circle"
              />
              Al menos debería tener una letra Mayúscula
            </p>
            <p
              :class="classNumber"
              class=" text-subtitle-2 mb-0 ml-3"
            >
              <VIcon
                v-if="numerosIcon == 'iconSuccess'"
                icon=" mdi-checkbox-marked-circle"
              />
              <VIcon
                v-if="numerosIcon == 'iconError'"
                icon="mdi-alpha-x-circle"
              />
              Al menos debería tener un número
            </p>
            <p
              :class="classSamePasswords"
              class="  text-subtitle-2 mb-0 ml-3"
            >
              <VIcon
                v-if="confirmPasswordIcon == 'iconSuccess'"
                icon="mdi-checkbox-marked-circle"
              />
              <VIcon
                v-if="confirmPasswordIcon == 'iconError'"
                icon="mdi-alpha-x-circle"
              />
              Las contraseñas son iguales
            </p>
          </div>
        </VCol>
      </VRow>
      <VCol
        cols="12"
        class="d-flex gap-4 flex-row-reverse mt-5"
      >
        <VBtn 
          type="submit"
          class="notAllowedEmulator"
        >
          {{ t('auth.keep') }}
        </VBtn>
        <VBtn
          :to="{ name: 'index' }"
          variant="outlined"
        >
          {{ t('auth.cancel') }}
        </VBtn>
      </VCol>
    </VForm>
  </VCard>
</template>

<route lang="yaml">
name: user-change-password
meta:
  authRequired: true
</route>
