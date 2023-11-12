import useJwt from '../jwt/useJwt'
import axios from '@/plugins/axios'

const { jwt } = useJwt(axios, {})
export default jwt
