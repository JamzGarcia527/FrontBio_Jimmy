import { ref } from "vue"

const bus = ref(new Map())

const useEventsBus = () => {

  const emit = (event, ...args) => {
    bus.value.set(event, args)
  }

  return {
    emit,
    bus,
  }
}

export default useEventsBus