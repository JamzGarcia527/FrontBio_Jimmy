<script setup>
import axios from '@/plugins/axios'
import { useMessage } from '@/stores/message'
import { useQuery } from '@tanstack/vue-query'

const messageStore = useMessage()

const getData = async () => {
  const { data } = await axios.get('v1/message/all')
  
  return data  
}

const { data } = useQuery(
  ['custom-message'], 
  () => getData(), {
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 10,
  },
)

watch(data, dash => {
  if (dash) messageStore.setData(dash)
})
</script>
