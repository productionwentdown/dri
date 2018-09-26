<template>
    <LoadableText :text="size" />
</template>

<script>
import filesize from 'filesize';
import { tag, blob } from '@/api';
import LoadableText from '@/components/LoadableText.vue';

export default {
  components: {
    LoadableText,
  },
  props: {
    repo: String,
    tag: String,
  },
  data() {
    return {
      size: '',
    };
  },
  async created() {
    const r = await tag(this.repo, this.tag);
    if (r.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json') {
      console.error('V2 manifest lists not supported yet');
      return;
    }
    if (r.schemaVersion === 1) {
      r.layers = r.fsLayers.map(l => ({ digest: l.blobSum }));
    }
    const sizes = await Promise.all(r.layers.map(async layer => (
      await blob(this.repo, layer.digest)
    ).contentLength));
    const total = sizes.reduce((a, b) => a + b, 0);
    this.size = filesize(total);
  },
};
</script>
