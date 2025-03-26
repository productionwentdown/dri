<template>
  <div>
    <!-- <span class="prev" @click="prev">Previous</span> -->
    <span class="next" @click="next" v-if="nextLast">Next</span>
  </div>
</template>

<script>
export default {
  props: {
    nextLast: String,
  },
  methods: {
    prev() {
      this.$router.back()
    },
    next() {
      this.$router.push(`?last=${this.nextLast}`)
    },
  },
}
</script>

<style scoped>
div {
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
}
div > span {
  padding: 0.75rem;
  color: #008;
}
</style>
