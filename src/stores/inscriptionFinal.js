import axios from "@/plugins/axios"

const initialState = () => ({
  information: {},
  candidates: {
    list: [],
  },
  committeeMembers: {
    list: [],
  },
})

export const useInscriptionFinal = defineStore('inscriptionFinal', {
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
    setCandidates(payload) {
      return new Promise((resolve, reject) => {
        const timePhoto = new Date().getTime()

        this.candidates.list = payload.map(e => ({ ...e, timePhoto }))
        resolve(payload)
      })
    },
    setCommitteeMembers(payload) {
      return new Promise((resolve, reject) => {
        this.committeeMembers.list = payload
        resolve(payload)
      })
    },
    setRadicate(payload) {
      return new Promise((resolve, reject) => {
        this.information.radicateId = payload
        resolve(payload)
      })
    },
    updateCandidatePhoto({ inscriptionId, candidateDni, hasPhoto }) {
      const candidate = this.candidates.list
        .find(e => e.dni == candidateDni)

      if (candidate) {
        candidate.timePhoto = new Date().getTime()
        candidate.hasPhoto = hasPhoto
      }
    },
    
  },
})
