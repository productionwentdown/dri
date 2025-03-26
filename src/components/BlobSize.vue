<template>
  <LoadableText :text="text" />
</template>

<script>
import filesize from 'filesize'
import { blob } from '@/api'
import LoadableText from '@/components/LoadableText.vue'

export default {
  components: {
    LoadableText,
  },
  props: {
    repo: String,
    blob: String,
    size: Number,
  },
  data() {
    return {
      text: '',
    }
  },
  async created() {
    if (this.size) {
      this.text = filesize(this.size)
      return
    }
    const size = await blob(this.repo, this.blob)
    if (size.contentLength) {
      this.text = filesize(size.contentLength)
    }
  },
}
</script>
