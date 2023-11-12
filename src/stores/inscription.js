import axios from "@/plugins/axios"

const initialState = () => ({
  information: {},
  candidates: {
    form: {},
    list: [],
  },
})

export const useInscription = defineStore('inscription', {
  state: () => ({ ...initialState() }) ,
  getters: {
    logoStatus: state => state.information.logoStatusCode,
    inscriptionId: state => state.information.id,
    groupingPoliticalId: state => state.information.groupingPoliticalId,
    radicate: state => state.information.radicateId,
    isUninominal: state => state.information.isUninominal,
    isPreferentialVote: state => state.information.isPreferentialVote,
    isBlankVotePromoter: state => state.information.isBlankVotePromoter,
    canUploadPhoto: state => state.information.canUploadPhoto,
    isReadonly: state => {
      const { state:stateIncrition } = state.information
      
      return stateIncrition != 1 
    },
    isReadonlyCommittee: state => !!state.information.isCommittee,
    isCoalition: state => state.information.groupingPoliticalTypeId === 4,
    allowedAddCandidate: state => state.information.limitCandidate > state.candidates.list.length,
    limitCandidate: state => state.information.limitCandidate,
    minAgeCandidate: state => state.information.minAgeCandidate,
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
    getInscription(payload) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/v1/inscriptions/${payload}`)
          .then(({ data }) => {
            this.information = data
            resolve(data)
          }).catch(error => reject(error))
      })
    },
    getCandidates(payload) {
      return new Promise((resolve, reject) => {
        axios.get(`/v1/candidates/list/${payload}`).then(({ data }) => {
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
        const exists = Boolean(payload.id)
        const endpoint = exists ? `/v1/candidates/${payload.id}` : '/v1/candidates'

        const requestBody = {
          ...payload, 
          inscriptionId: this.information.id,
        }

        axios.request(endpoint, { 
          method: exists ? 'PUT' : 'POST',
          data: requestBody,
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
          inscriptionId: this.information.id,
        }

        axios.post('/v1/candidates/change-order', requestBody)
          .then(({ data }) => {
            this.candidates.list = data
            resolve(data)
          }).catch(error => reject(error))
      })
    },
    removeCandidate(payload) {
      return new Promise((resolve, reject) => {
        axios.delete(`/v1/candidates/${payload}`)
          .then(({ data }) => {
            this.candidates.list = data
            resolve(data)
          }).catch(error => reject(error))
      })
    },
  },
})
