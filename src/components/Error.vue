<template>
  <div v-if="message">{{ message }}</div>
</template>

<script>
export default {
  props: {
    message: String,
  },
}
</script>

<style scoped>
div {
  text-align: center;
  background: #fdd;
  color: #800;
  padding: 0.5rem 0.75rem;
  margin: 1rem;
  border-radius: 0.5rem;
}
</style>
