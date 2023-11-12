import useJwt from '../jwt/useJwt'
import axios from '@/plugins/axios'

const { axiosJwt } = useJwt(axios, {})
export default axiosJwt
