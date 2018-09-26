<template>
    <router-link tag="tr" :to="to || {}">
        <td class="col title"><slot name="title" /></td>
        <td class="col detail" v-if="$slots.detail"><slot name="detail" /></td>
        <td class="col date" v-if="$slots.date"><slot name="date" /></td>
        <td class="col size" v-if="$slots.size"><slot name="size" /></td>
        <td class="col buttons" v-if="$slots.buttons"><slot name="buttons" /></td>
    </router-link>
</template>

<script>
export default {
  props: {
    to: { type: [Object, String], required: false },
  },
};
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
.title {
    text-align: left;
}
.detail {
    font-size: 0.8em;
}
</style>
