<template>
  <tr>
    <td class="col title link">
      <router-link v-if="to" :to="to">
        <slot name="title"></slot>
      </router-link>
    </td>
    <td class="col title" v-if="!to"><slot name="title"></slot></td>
    <td class="col detail" v-if="$slots.detail"><slot name="detail"></slot></td>
    <td class="col date" v-if="$slots.date"><slot name="date"></slot></td>
    <td class="col size" v-if="$slots.size"><slot name="size"></slot></td>
    <td class="col buttons" v-if="$slots.buttons"><slot name="buttons"></slot></td>
  </tr>
</template>

<script>
export default {
  props: {
    to: { type: [Object, String], required: false },
  },
}
</script>

<style scoped>
tr:hover {
  background: #f4f4f4;
}
td {
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
  border-bottom: 1px solid #eee;
  border-bottom-width: 0.5px;
  text-align: right;
}
.link {
  cursor: pointer;
}
.title {
  text-align: left;
}
.detail {
  font-size: 0.8em;
}
</style>
