<template>
	<LoadableText :text="text" />
</template>

<script>
import filesize from 'filesize';
import { tag } from '@/api';
import LoadableText from '@/components/LoadableText.vue';

export default {
	components: {
		LoadableText,
	},
	props: {
		repo: String,
		tag: String,
		size: Number,
	},
	data() {
		return {
			text: '',
		};
	},
	async created() {
		const r = await tag(this.repo, this.tag);
		if (r.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json') {
			console.error('V2 manifest lists not supported yet');
			return;
		}
		if (r.schemaVersion === 1) {
			console.error('V1 manifests not supported');
			return;
		}
		const total = r.layers.reduce((a, b) => a + b.size, 0);
		this.text = filesize(total);
	},
};
</script>
