<template>
    <div class="wrapper">
        <header>
            <slot name="title" />
            <slot name="error" />
            <slot name="toolbar" />
        </header>
        <main>
            <div class="content">
                <slot />
            </div>
        </main>
        <footer>
            <p>
                <a :href="source">dri</a>
                {{ version }}
                by <a href="https://github.com/serverwentdown">@serverwentdown</a>
            </p>
        </footer>
    </div>
</template>

<script>
import { version, source } from '@/options';

export default {
  data() {
    return {
      version,
      source,
    };
  },
};
</script>

<style scoped>
header, footer, main {
    margin: 0 auto;
}
header, footer, .content {
    padding: 1rem;
}
header, footer {
    max-width: 38rem;
    text-align: center;
}
main {
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
}
</style>
