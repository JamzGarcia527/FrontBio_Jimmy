import { defineStore } from 'pinia'
import { filterStateKey } from '@/constants/localStorageKeys'
import axios from '@/plugins/axios'
import { strPad } from '@/utils'

const filterTypes = {
  1: 'departments',
  2: 'municipalities',
  3: 'communes',
}

const initState = () => ({
  isFilled: false,
  selected: {
    department: -1,
    municipality: -1,
    commune: -1,
    corporationId: -1,
    circunscriptionId: -1,
    isBlankVotePromote: -1,
    groupingPoliticalTypeId: -1,
    groupingPoliticalId: -1, 
    inscriptionTypeId: -1,
    letterTypeId: -1,
  },
  list: {
    departments: [],
    municipalities: [],
    communes: [],
    corporations: [],
    circunscriptions: [],
    genders: [],
    groupingPoliticalTypes: [],
    groupingPoliticals: [],
    inscriptionTypes: [],
    differentialFocus: [],
    letterTypes: [],
    reasonsRemoved: [],
  },
})

export const useGeneralFilter = defineStore('generalfilter', {
  state: () => ({ ...initState() }),
  getters: {
    // Getters Selected Ids
    idCorporation: ({ selected }) => selected.corporationId,
    idCircunscription: ({ selected }) => selected.circunscriptionId,
    idDepartment: ({ selected }) => selected.department,
    idMunicipality: ({ selected }) => selected.municipality,
    idCommune: ({ selected }) => selected.commune,
    isBlankVotePromote: ({ selected }) => selected.isBlankVotePromote,
    idGroupingPoliticalType: ({ selected }) => selected.groupingPoliticalTypeId,
    idGroupingPolitical: ({ selected }) => selected.groupingPoliticalId,
    idInscriptionType: ({ selected }) => selected.inscriptionTypeId,
    idLetterType: ({ selected }) => selected.letterTypeId,

    // Get Utils
    enableDeparment: ({ selected, list }) => {
      const enableLevels = ['DE', 'MU', 'CO']
      const { corporationId } = selected
      const { corporations } = list
      
      const corporation = corporations.find(c => c.id === corporationId)

      return (corporation && enableLevels.includes(corporation.level))
    },
    enableMunicipality: ({ selected, list }) => {
      const enableLevels = ['MU', 'CO']
      const { corporationId } = selected
      const { corporations } = list
      
      const corporation = corporations.find(c => c.id === corporationId)

      return (corporation && enableLevels.includes(corporation.level))
    },
    enableCommune: ({ selected, list }) => {
      const enableLevels = ['CO']
      const { corporationId } = selected
      const { corporations } = list
      
      const corporation = corporations.find(c => c.id === corporationId)

      return (corporation && enableLevels.includes(corporation.level))
    },

    // Getters List
    corporations: ({ selected, list }) => {
      const { groupingPoliticalId } = selected
      const { groupingPoliticals } = list

      const group = groupingPoliticals.find(a => a.id === groupingPoliticalId)

      if (!group || !group.allowedCorporations) return list.corporations
      

      return list.corporations.filter(e => group.allowedCorporations.includes(String(e.id)))
    },
    circunscriptions: ({ list }) => list.circunscriptions,
    circunscriptionsByCorporation: ({ selected, list }) => {
      const { corporationId } = selected
      const { corporations, circunscriptions } = list

      const currentCorporation = corporations.find(c => c.id === corporationId)
      const allowedCircunscriptions = currentCorporation?.circunscriptions || []
      
      return circunscriptions.filter(c => allowedCircunscriptions.includes(c.id))
    },
    departments: ({ list, selected }) => {
      const { corporationId } = selected  
      const array = list.departments
      if (!corporationId || corporationId == -1) 
        return array 
      
      return array.filter(e => {    
        const array = String(e.allowCorporations).split(',')

        return array.includes(String(corporationId))
      })
    },
    municipalities: ({ list, selected }) => {
      const { department, corporationId } = selected
      if (!department) return []
      const parent_id = strPad(department, 2)

      const array = list.municipalities
        .filter(a => a.parent_id === parent_id)

      if (!corporationId || corporationId == -1) 
        return array 
      
      return array.filter(e => {    
        const array = String(e.allowCorporations).split(',')

        return array.includes(String(corporationId))
      })
    },
    comunes: ({ list, selected }) => {
      const { department, municipality } = selected
      if (!department || !municipality) return []
      const parent_id = `${strPad(department, 2)}${strPad(municipality, 3)}`
      
      return list.communes
        .filter(a => a.parent_id === parent_id)
        .sort((a, b) => a.id > b.id)
    },
    groupingPoliticalTypes: ({ list }) => list.groupingPoliticalTypes,
    groupingPoliticalsByType: ({ selected, list }) => {
      const { groupingPoliticalTypeId } = selected
      
      return list.groupingPoliticals.filter(g => g.groupingPoliticalType == groupingPoliticalTypeId)
    },
    groupingPoliticals: ({ list }) => list.groupingPoliticals,
    inscriptionTypes: ({ list }) => list.inscriptionTypes,
    genders: ({ list }) => list.genders,
    differentialFocus: ({ list }) => list.differentialFocus,
    letterTypes: ({ list }) => list.letterTypes,
    reasonsRemoved: ({ list }) => list.reasonsRemoved,
  },

  actions: {
    initSelected(payload = {}) {
      const { selected } = initState()

      this.selected = { ...selected, ...payload }
    },
    async loadFilters() {
      if (this.isFilled && localStorage.hasOwnProperty(filterStateKey)) return
      const { data } = await axios.get('/filters/user-data')

      const { 
        circunscriptions, 
        gender: genders,
        grouping_political_types: groupingPoliticalTypes,
        differentialFocus,
        reasonsRemoved,
      } = data

      const corporations = data.corporations.map(e => ({ ...e, circunscriptions: JSON.parse(e.circunscriptions || "[]") }))

      const groupingPoliticals = data.groupings_political.map(e => {
        if (!e.allowedCorporations) return e

        return { ...e, allowedCorporations: String(e.allowedCorporations).split(',') }
      })

      const inscriptionTypes = [{ id: 1, name: 'Virtual' }, { id: 2, name: 'Manual' }]

      const letterTypes = [{ id: 1, name: 'Renuncias' }, { id: 2, name: 'Aceptó Candidatura' }]

      const divipol = data.divipol.reduce((acc, item) => {
        const { level, id, ...result } = item
        const valueType = filterTypes[level]
        if (valueType !== null && acc[valueType] instanceof Array)
          acc[valueType].push({ ...result, id: Number(id) })
        
        return acc
      }, {
        departments: [],
        municipalities: [],
        communes: [],
      })

      this.list = {
        differentialFocus,
        groupingPoliticalTypes,
        groupingPoliticals,
        corporations,
        circunscriptions,
        genders,
        inscriptionTypes,
        letterTypes,
        reasonsRemoved,
        ...divipol,
      }

      this.isFilled = true
    },
    setCorporation(payload) {
      this.selected.corporationId = payload
      this.selected.circunscriptionId = -1
      this.setDepartment(-1)

      const corp = this.list.corporations.find(e => e.id === payload)
      if (corp && corp.circunscriptions.length == 1) {
        this.selected.circunscriptionId = corp.circunscriptions[0]
      }
    },

    // Seteo la corporación sin que se me setee la circunscipción
    setCorporationWhitoutCircunscription(payload) {
      this.selected.corporationId = payload
    },
    setCircunscription(payload) {
      this.selected.circunscriptionId = payload
    },
    setBlankVotePromoter(payload) {
      this.selected.isBlankVotePromote = payload
    },
    setDepartment(payload) {
      this.selected.department = payload
      this.selected.municipality = -1
      this.selected.commune = -1
    },
    setMunicipality(payload) {
      this.selected.municipality = payload
      this.selected.commune = -1
    },
    setCommune(payload) {
      this.selected.commune = payload
    },
    setGroupingPoliticalType(payload) {
      this.selected.groupingPoliticalTypeId = payload
      this.selected.groupingPoliticalId = -1
    },
    setGroupingPolitical(payload, reset = true) {
      this.selected.groupingPoliticalId = payload
      if (reset) this.setCorporation(-1)
    },
    setInscriptionType(payload) {
      this.selected.inscriptionTypeId = payload
    },
    setLetterType(payload) {
      this.selected.letterTypeId = payload
    },
    saveDifferentialFocus(payload) {
      return new Promise((resolve, reject) => {
        const { id, ...requestBody } = payload
        const exists = Boolean(id)
        const endpoint = exists ? `/v1/differential-focus/${id}` : '/v1/differential-focus'

        axios.request(endpoint, { 
          method: exists ? 'PUT' : 'POST',
          data: requestBody,
        }).then(({ data }) => {
          this.list.differentialFocus = data
          resolve(data)
        }).catch(error => reject(error))
      })      
    },
  },
  persist: {
    key: filterStateKey,
  },
})

