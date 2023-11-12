import { userdatakey } from '@/constants/localStorageKeys'
import { Ability } from '@casl/ability'

export const initialAbility = [
  {
    action: 'read',
    subject: 'Auth',
  },
  {
    action: 'navigation',
    subject: 'menu',
  },
]

const extractAbility = stringify => {
  const userconfig = JSON.parse(stringify)
  
  return [ ...userconfig?.permissions, ...initialAbility ] || null
}

//  Read ability from localStorage
// 👉 Handles auto fetching previous abilities if already logged in user
// ℹ️ You can update this if you store user abilities to more secure place
// ❗ Anyone can update localStorage so be careful and please update this
const stringifiedUserAbilities = localStorage.getItem(userdatakey)
const existingAbility = stringifiedUserAbilities ? extractAbility(stringifiedUserAbilities) : null
export default new Ability(existingAbility || initialAbility)
