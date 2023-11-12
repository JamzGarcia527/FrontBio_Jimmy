import axios from "@/plugins/axios"
import { useGeneralFilter as useGeneralFilterStore } from "@/stores/generalfilter"
import { strPad } from '@/utils'

export const useGeneralFilter = () => {
  const store = useGeneralFilterStore()

  store.loadFilters()

  const getDepartments = () => {
    return store.list.departments
  }

  const getMunicipalitiesByDepartment = idDepartment => {
    return store.list.municipalities.filter(a => Number(a.parent_id) === Number(idDepartment))
  }

  const getCommunes = (idDepartment, idMunicipality) => {
    if (!idDepartment || !idMunicipality) return []
    const parent_id = `${strPad(idDepartment, 2)}${strPad(idMunicipality, 3)}`
      
    return store.list.communes.filter(a => a.parent_id === parent_id)
  }

  const isCorporationUninominal = idCorporation => {
    return store.list.corporations.some(e => {
      return Number(idCorporation) === Number(e.id) && e.type == 'MA'
    })
  }

  const getGroupingPoliticalsTypes = () => {
    return store.list.groupingPoliticalTypes
  }

  const getGroupingPoliticalsByType = groupingPoliticalTypeId => {
    return store.list.groupingPoliticals.filter(g => g.groupingPoliticalType == groupingPoliticalTypeId)
  }

  const getNameDeparment = idDepartment => {    
    const department = store.list.departments.find(e => e.id == idDepartment)
    if (department) return department.name
    
    return ''
  }

  const getCorporations = () => {
    return store.list.corporations
  }

  const initSelected = (payload = {}) => store.initSelected(payload)


  const getDepartmentsFromApi = async () => {
    try {
      const { data } = await axios.get('/filters/user-data/all-departments')

      return data
    } catch (e) {
      console.error("No fue posible cargar los departamentos.")
      
      return []
    }
  }

  const getMunicipalitiesFromApi = async department => {
    try {
      const { data } = await axios.get(`/filters/user-data/all-municipalities/${department}`)

      return data
    } catch (e) {
      console.error("No fue posible cargar los departamentos.")
      
      return []
    }
  }

  const getCommunesFromApi = async municipality => {
    try {
      const { data } = await axios.get(`/filters/user-data/all-communes/${municipality}`)

      return data.sort((a, b) => a.id - b.id)
    } catch (e) {
      console.error("No fue posible cargar las comunas.")
      
      return []
    }
  }

  const getCorporationsFromApi = async () => {
    try {
      const { data } = await axios.get(`/filters/user-data/all-corporations`)

      return data
    } catch (e) {
      console.error("No fue posible cargar las corporaciones.")
      
      return []
    }
  }

  return {
    getDepartments,
    getMunicipalitiesByDepartment,
    isCorporationUninominal,
    getGroupingPoliticalsTypes,
    getGroupingPoliticalsByType,
    initSelected,
    getNameDeparment,
    getCommunes,
    getCorporations,
    getCorporationsFromApi,
    getDepartmentsFromApi,
    getMunicipalitiesFromApi,
    getCommunesFromApi,
  }
}
