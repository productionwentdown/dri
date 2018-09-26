<template>
    <table>
        <thead>
            <slot name="header" />
        </thead>
        <tbody>
            <slot />
        </tbody>
    </table>
</template>

<style scoped>
table {
    min-width: 28rem;
    border-spacing: 0;
}
</style>
