import axios from 'axios'
import { API_BASEURL } from '@/constants/config'

const axiosIns = axios.create({
// You can add your headers here
// ================================
// baseURL: 'https://some-domain.com/api/',
// timeout: 1000,
// headers: {'X-Custom-Header': 'foobar'}
  baseURL: API_BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export default axiosIns
