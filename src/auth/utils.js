import useJwt from '@/auth/service/useJwt'
import { userdatakey } from '@/constants/localStorageKeys'

/**
 * Return if user is logged in
 * This is completely up to you and how you want to store the token in your frontend application
 * e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem(userdatakey) && localStorage.getItem(useJwt.jwtConfig.storageTokenKeyName)
}

export const getUserData = () => JSON.parse(localStorage.getItem(userdatakey))
