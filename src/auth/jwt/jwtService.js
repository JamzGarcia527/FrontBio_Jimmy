import Swal from "@/plugins/sweetalert2"
import jwtDefaultConfig from './jwtDefaultConfig'

export default class JwtService {
  // Will be used by this service for making API calls
  axiosIns = null

  // jwtConfig <= Will be used by this service
  jwtConfig = { ...jwtDefaultConfig }

  // For Refreshing Token
  isAlreadyFetchingAccessToken = false

  // For Refreshing Token
  subscribers = []

  constructor(axiosIns, jwtOverrideConfig) {
    this.axiosIns = axiosIns
    this.jwtConfig = { ...this.jwtConfig, ...jwtOverrideConfig }

    // Request Interceptor
    this.axiosIns.interceptors.request.use(
      config => {
        // Get token from localStorage
        
        const accessToken = this.getToken()

        // If token is present add it to request's Authorization Header
        if (accessToken) {
          // eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
        }
        
        return config
      },
      error => Promise.reject(error),
    )

    // Add request/response interceptor
    this.axiosIns.interceptors.response.use(
      response => response,
      error => {
        const { config, response } = error
        const originalRequest = config

        if (response && response.status === 401) {
          if (response.data && response.data.status === 'UNAUTHORIZED') {
            this.modalClose()
            this.isAlreadyFetchingAccessToken = false
          } else if (!this.isAlreadyFetchingAccessToken) {
            this.isAlreadyFetchingAccessToken = true
            this.refreshToken().then(({ data: r }) => {
              if (r && r.accessToken) {
                this.isAlreadyFetchingAccessToken = false

                // Update accessToken in localStorage
                this.setToken(r.accessToken)
                this.setRefreshToken(r.refreshToken)
                this.onAccessTokenFetched(r.accessToken)
              } else {
                this.modalClose()
              }
            }).catch(() => {
              this.modalClose()
            })
          }

          return new Promise(resolve => {
            this.addSubscriber(accessToken => {
              // Make sure to assign accessToken according to your response.
              // Check: https://pixinvent.ticksy.com/ticket/2413870
              // Change Authorization header
              originalRequest.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
              resolve(this.axiosIns(originalRequest))
            })
          })
        }
        
        return Promise.reject(error)
      },
    )
  }

  modalClose() {
    Swal.fire({
      title: '¡Su sesión ha expirado!',
      text: 'Por favor, inicie sesión nuevamente.',
      icon: 'error',
      confirmButtonText:'Aceptar',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      // ejectuar evento close
      window.location.replace('/logout')
    })
  }

  onAccessTokenFetched(accessToken) {
    this.subscribers = this.subscribers.filter(callback => callback(accessToken))
  }

  addSubscriber(callback) {
    this.subscribers.push(callback)
  }

  getToken() {
    return localStorage.getItem(this.jwtConfig.storageTokenKeyName)
  }

  getRefreshToken() {
    return localStorage.getItem(this.jwtConfig.storageRefreshTokenKeyName)
  }

  setToken(value) {
    localStorage.setItem(this.jwtConfig.storageTokenKeyName, value)
  }

  setRefreshToken(value) {
    localStorage.setItem(this.jwtConfig.storageRefreshTokenKeyName, value)
  }

  login(...args) {
    //console.log('hola entre ', ...args )
    // return this.axiosIns.post(this.jwtConfig.loginEndpoint, ...args).then(res => {
    // //  console.log(res,'res');
    // }).catch(err => {
    //   console.log(err.response);
    // });

    try {
      // Realiza cualquier procesamiento adicional si es necesario
      return this.axiosIns.post(this.jwtConfig.loginEndpoint, ...args)  // Retorna los datos de la respuesta
    } catch (error) {
      if (error.response) {
        console.log("Error de respuesta:", error.response.data)
      } else if (error.request) {
        console.log("Error de solicitud:", error.request)
      } else {
        console.log("Error general:", error.message)
      }
      throw error  // Puedes lanzar el error nuevamente si es necesario
    }
  }

  register(...args) {
    return this.axiosIns.post(this.jwtConfig.registerEndpoint, ...args)
  }

  refreshToken() {
    return this.axiosIns.post(this.jwtConfig.refreshEndpoint, {
      refresh_token: this.getRefreshToken(),
    })
  }
}
