<template>
  <div>
    <VBtn color="primary" @click="listar">
      listar
    </VBtn>
  </div>
</template>
 

<script>
import axios from "@/plugins/axios"

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    axios,
  },
  data: () => ({}),
  methods: {
    listar() {
      axios
        .get("/v1/user", {
          username: "leo",
          email: "leonardo.castillo@thomasgreg.com",
          recaptcha_token: "asfasdfasdfasdf",
        })
        .then(({ data }) => {
          console.table(data)
        })
    },
  },
}
</script>
