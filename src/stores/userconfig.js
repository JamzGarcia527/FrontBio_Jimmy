import { defineStore } from 'pinia'
import { userdatakey } from '@/constants/localStorageKeys'

const initState = () => ({
  userData: {
    username: "unlogged",
    role: "unknow",
    firstName: "",
    firstSurname: "",
    changePassword: false,
  },
  permissions: [],
  menu: [],
}) 

export const useUserConfigStore = defineStore('userconfig', {
  state: () => ({ ...initState()  }),
  getters: {
    fullName: state => `${state.userData.firstName} ${state.userData.firstSurname}`,
    role: state => state.userData.role,
    changePassword: state => state.userData.changePassword,
    isEmulated: state => state.userData.emulated,
    isCommittee: state => {
      const { groupingPolitical = null } = state.userData
      if (!groupingPolitical) return false 
      const committeeIds = [2,3]
      
      return Boolean(groupingPolitical.isCommittee) 
        || committeeIds.includes(groupingPolitical.grouping_political_type)
    },
    isCoalition: state => {
      const { groupingPolitical = null } = state.userData
      if(groupingPolitical === 4) return true
    },
    currentPhase: state => state.userData.currentPhase,
    idleTime: state => {
      const { idle_time = 300 } = state.userData
      
      return idle_time * 1000
    },
  },
  actions: {
    setUserConfig(payload) {
      
      const { roleDetail, ...userData } = payload
      const { permissions = [], menu = [], code: roleCode, name: role } = roleDetail
      
      this.menu = menu
      this.permissions = permissions.map(permission => {
        const p = String(permission).split(':')

        return { subject: p[0], action: p[1] }
      })

      this.userData = { role, roleCode, ...userData }
    },
    initUserConfig() {
      const { userData, permissions, menu } = initState()
      
      this.userData = userData
      this.permissions = permissions
      this.menu = menu
    },
    setChangePassword(payload) {
      this.userData.changePassword = Boolean(payload)
    },
  },
  persist: {
    key: userdatakey,
  },
})
