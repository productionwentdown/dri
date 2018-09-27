<template>
    <Layout>
        <h1 slot="title">{{ $route.params.repo }}:{{ $route.params.tag }}</h1>
        <Error slot="error" :message='error' />
        <h2>Details</h2>
        <List>
            <ListItem>
                <span slot="title">Schema Version</span>
                <span slot="detail">{{ tag.schemaVersion }}</span>
            </ListItem>
            <ListItem>
                <span slot="title">Architecture</span>
                <span slot="detail">{{ tag.architecture }}</span>
            </ListItem>
            <ListItem>
                <span slot="title">Size</span>
                <span slot="detail">
					<TagSize :repo="$route.params.repo" :tag="$route.params.tag" />
				</span>
            </ListItem>
        </List>
        <h2>Layers</h2>
        <List>
            <ListHeader slot="header">
                <span slot="title">Digest</span>
                <span slot="detail">Summary</span>
                <span slot="size">Size</span>
            </ListHeader>
            <ListItem
               v-for="(layer, i) in tag.layers"
               :key="i"
               :to="{ name: 'blob', params: { repo: $route.params.repo, digest: layer.digest }}">
                <span slot="title" :title="layer.digest">{{ identifier(tag, i) }}</span>
                <span slot="detail">{{ command(tag, i) }}</span>
                <BlobSize slot="size" :repo="$route.params.repo" :blob="layer.digest" />
            </ListItem>
        </List>
    </Layout>
</template>

<script>
import { registryHost } from '@/options';
import { tag } from '@/api';

import Layout from '@/components/Layout.vue';
import Error from '@/components/Error.vue';
import Toolbar from '@/components/Toolbar.vue';
import List from '@/components/List.vue';
import ListHeader from '@/components/ListHeader.vue';
import ListItem from '@/components/ListItem.vue';
import TagSize from '@/components/TagSize.vue';
import BlobSize from '@/components/BlobSize.vue';

export default {
	components: {
		Layout,
		Error,
		Toolbar,
		List,
		ListHeader,
		ListItem,
		TagSize,
		BlobSize,
	},
	data() {
		return {
			error: '',
			registryHost: '',
			tag: {},
			layers: [],
		};
	},
	async created() {
		this.registryHost = await registryHost();
		await this.fetchTag();
	},
	methods: {
		async fetchTag() {
			try {
				const r = await tag(this.$route.params.repo, this.$route.params.tag);
				if (r.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json') {
					this.error = 'V2 manifest lists not supported yet';
				}
				if (r.schemaVersion === 1) {
					r.layers = r.fsLayers.map(l => ({ digest: l.blobSum }));
				}
				this.tag = r;
				console.log(r);
			} catch (e) {
				console.error(e);
				this.error = `Unable to fetch tag (${e.name})`;
			}
		},
		identifier(t, n) {
			return t.layers[n].digest.split(':')[1].slice(0, 10);
		},
		command() {
			return 'not implemented';
		},
	},
	watch: {
		async $route() {
			await this.fetchTag();
		},
	},
};
</script>
