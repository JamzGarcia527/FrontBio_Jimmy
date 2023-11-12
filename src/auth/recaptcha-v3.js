import { load } from 'recaptcha-v3'
import { GOOGLE_RECAPTCHA_SITEKEY } from '@/constants/config'



const recaptcha = () => {
  let instance = null

  const loadInstance = async () => {
    instance = await load(GOOGLE_RECAPTCHA_SITEKEY)
  }

  const execute = action => instance.execute(action)

  const show = () => {
    instance.showBadge()
  }

  const hide = () => {
    instance.hideBadge()
  }

  
  return {
    loadInstance,
    execute,
    show,
    hide,
  }
}



export default recaptcha()
