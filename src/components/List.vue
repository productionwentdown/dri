<template>
  <table>
    <thead>
      <slot name="header"></slot>
    </thead>
    <tbody>
      <slot></slot>
    </tbody>
  </table>
</template>

<style scoped>
table {
  min-width: 28rem;
  border-spacing: 0;
}
</style>
