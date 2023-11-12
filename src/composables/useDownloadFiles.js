import axios from "@/plugins/axios"

export const useDownloadFiles = url => {
  
  const isLoading = ref(false)
  const data = ref(null)
  const isError = ref(false)
  const error = ref(null)

  const download = () => {
    data.value = null
    if (url?.value) {
      axios
        .get(url.value, { responseType: "blob" } )
        .then(res => {
          data.value = window.URL.createObjectURL(res.data)
        }).catch(e => {
          isError.value = true
          error.value = e
        })
    }
  }

  watch(url, () => {
    if (data.value) {
      window.URL.revokeObjectURL(data)
    }
    download()
  })

  onMounted(() => {
    download()
  })

  onUnmounted(() => {
    if (data.value) {
      window.URL.revokeObjectURL(data)
    }
  })

  const refetch = () => {
    if (data.value) {
      window.URL.revokeObjectURL(data)
    }
    download()
  }

  return {
    isLoading,
    data,
    isError,
    error,
    refetch,
  }
}
