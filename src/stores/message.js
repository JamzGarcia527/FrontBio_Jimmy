import { messageStateKey } from '@/constants/localStorageKeys'

const initialState = () => ({
  data: {},
})

export const useMessage = defineStore('message', {
  state: () => ({ ...initialState() }) ,
  actions: {
    setData(payload) {
      this.data = payload
    },
  },
  persist: {
    key: messageStateKey,
  },
})
