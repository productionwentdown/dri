<template>
    <tr>
        <th class="col title"><slot name="title" /></th>
        <th class="col detail" v-if="$slots.detail"><slot name="detail" /></th>
        <th class="col date" v-if="$slots.date"><slot name="date" /></th>
        <th class="col size" v-if="$slots.size"><slot name="size" /></th>
        <th class="col buttons" v-if="$slots.buttons"><slot name="buttons" /></th>
    </tr>
</template>

<style scoped>
th {
    padding: 0.5rem;
    white-space: nowrap;
    font-size: 0.8em;
    text-align: left;
    border-bottom: 1px solid #eee;
    text-align: right;
}
.title {
    text-align: left;
}
</style>
