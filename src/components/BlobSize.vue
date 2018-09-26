<template>
    <LoadableText :text="size" />
</template>

<script>
import filesize from 'filesize';
import { blob } from '@/api';
import LoadableText from '@/components/LoadableText.vue';

export default {
  components: {
    LoadableText,
  },
  props: {
    repo: String,
    blob: String,
  },
  data() {
    return {
      size: '',
    };
  },
  async created() {
    const size = await blob(this.repo, this.blob);
    this.size = filesize(size.contentLength);
  },
};
</script>
