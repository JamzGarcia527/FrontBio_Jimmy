import { useMessage } from "@/stores/message"

export const useCustomMessage = () => {
  const store = useMessage()

  const exists = code => store.data.hasOwnProperty(code)
  const get = code => store.data[code]

  return { exists, get }
}
