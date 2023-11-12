import axios from "@/plugins/axios"

const initialState = () => ({
  information: {},
  candidates: {
    form: {},
    list: [],
  },
})

export const useInscriptionModify = defineStore('inscriptionModify', {
  state: () => ({ ...initialState() }) ,
  getters: {
    logoStatus: state => state.information.logoStatusCode,
    inscriptionId: state => state.information.inscriptionId,
    inscriptionChangeId: state => state.information.inscriptionChangeId,
    groupingPoliticalId: state => state.information.groupingPoliticalId,
    radicate: state => state.information.inscriptionChangeRadicateId,
    isUninominal: state => state.information.isUninominal,
    isPreferentialVote: state => state.information.preferentialVote,
    isBlankVotePromoter: state => state.information.blankVotePromoter,
    isCoalition: state => state.information.groupingPoliticalTypeId === 4,
    canUploadPhoto: state => state.information.canUploadPhoto,
    isReadonly: state => {
      const { inscriptionChangeStateCode: stateIncrition } = state.information
      
      return stateIncrition != 1 
    },
    isReadonlyCommittee: state => !!state.information.isCommittee,
    isExtemporaneous: state => !!state.information.isExtemporaneous,
    allowedAddCandidate: state => state.information.limitCandidate > state.candidates.list.length,
    limitCandidate: state => state.information.limitCandidate,
    minAgeCandidate: state => state.information.minAge,
    minCandidateQuotaGender: state => state.information.minCandidateQuotaGender,
    minPercentageQuotaGender: state => state.information.minPercentageQuotaGender,
    candidateGenderCounter: state => {
      const { list: candidates } = state.candidates
      
      return candidates.reduce((acc, item) => {
        if (!acc[item.gender]) acc[item.gender] = 0
        acc[item.gender] += 1
        
        return acc
      }, {})
    },
  },
  actions: {
    setInitialState() {
      this.information = {}
      this.candidates = {
        form: {},
        list: [],
      }
    },
    getInscription(payload) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/v1/inscription-change/${payload}`)
          .then(({ data }) => {
            this.information = data
            resolve(data)
          }).catch(error => reject(error))
      })
    },
    getCandidates(payload) {
      return new Promise((resolve, reject) => {
        axios.get(`/v1/candidates-changes/inscription-change/${payload}`).then(({ data }) => {
          const timePhoto = new Date().getTime()

          this.candidates.list = data.map(e => ({ ...e, timePhoto }))
          resolve(data)
        }).catch(error => reject(error))
      })
    },
    updateCandidatePhoto({ inscriptionId, candidateDni, hasPhoto }) {
      const candidate = this.candidates.list
        .find(e => e.inscriptionId == inscriptionId && e.dni == candidateDni)

      if (candidate) {
        candidate.timePhoto = new Date().getTime()
        candidate.hasPhoto = hasPhoto
      }
    },
    saveCandidate(payload) {
      return new Promise((resolve, reject) => {
        axios.post('/v1/candidates-changes', {
          ...payload, 
          inscriptionChangeId: this.information.inscriptionChangeId,
        }).then(({ data }) => {
          this.candidates.list = data
          resolve(data)
        }).catch(error => reject(error))
      })
    },
    exchangeCandidate(payload) {
      return new Promise((resolve, reject) => {
        const requestBody = {
          oldOrder: payload.source, 
          newOrder: payload.target,
          inscriptionChangeId: this.information.inscriptionChangeId,
        }

        axios.post('/v1/candidates-changes/change-order', requestBody)
          .then(({ data }) => {
            this.candidates.list = data
            resolve(data)
          }).catch(error => reject(error))
      })
    },
    removeCandidate(payload) {
      return new Promise((resolve, reject) => {
        axios.delete(`/v1/candidates/${payload}`) // TODO: pendiente de cambiar por E7
          .then(({ data }) => {
            this.candidates.list = data
            resolve(data)
          }).catch(error => reject(error))
      })
    },
  },
})
