<template>
	<Layout>
		<h1 slot="title">{{ $route.params.repo }}:{{ $route.params.tag }}</h1>
		<Error slot="error" :message='error' />
		<Toolbar slot="toolbar">
			<ToolbarButton v-if="tagCanDelete" @click="deleteTag" danger>Delete</ToolbarButton>
		</Toolbar>
		<h2>Details</h2>
		<List>
			<ListItem>
				<span slot="title">Schema Version</span>
				<span slot="detail">{{ tag.schemaVersion }}</span>
			</ListItem>
			<ListItem>
				<span slot="title">Full Digest</span>
				<span slot="detail">{{ tag.headers.get('Docker-Content-Digest') }}</span>
			</ListItem>
			<ListItem>
				<span slot="title">Date Created</span>
				<span slot="date">{{ new Date(config.created).toLocaleString() }}</span>
			</ListItem>
			<ListItem>
				<span slot="title">Platform</span>
				<span slot="detail">{{ config.os }} {{ config.architecture }}</span>
			</ListItem>
			<ListItem>
				<span slot="title">Entrypoint</span>
				<span slot="detail"><code>{{ config.config.Entrypoint }}</code></span>
			</ListItem>
			<ListItem>
				<span slot="title">Command</span>
				<span slot="detail"><code>{{ config.config.Cmd }}</code></span>
			</ListItem>
			<ListItem>
				<span slot="title">Labels</span>
				<span slot="detail">
					<ul style="text-align: left; list-style: none;">
						<li v-for="(v, k) in config.config.Labels" :key="k">
							<code>{{ k }}: {{ v }}</code>
						</li>
					</ul>
				</span>
			</ListItem>
			<ListItem>
				<span slot="title">Layers</span>
				<span slot="size">{{ tag.layers.length }}</span>
			</ListItem>
			<ListItem>
				<span slot="title">Size</span>
				<span slot="size">
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
				<BlobSize slot="size" :size="layer.size" />
			</ListItem>
		</List>
	</Layout>
</template>

<script>
import { registryHost } from '@/options';
import { tag, tagCanDelete, tagDelete, configBlob } from '@/api';

import Layout from '@/components/Layout.vue';
import Error from '@/components/Error.vue';
import Toolbar from '@/components/Toolbar.vue';
import ToolbarButton from '@/components/ToolbarButton.vue';
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
		ToolbarButton,
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
			tag: { },
			config: {},
			tagCanDelete: false,
			layers: [],
		};
	},
	async created() {
		this.registryHost = await registryHost();
		await this.fetchTag();
	},
	methods: {
		async deleteTag() {
			// eslint-disable-next-line no-alert
			if (!window.confirm(`Are you sure you want to delete ${this.$route.params.repo}:${this.$route.params.tag}?`)) {
				return;
			}
			try {
				await tagDelete(this.$route.params.repo, this.$route.params.tag);
				this.$router.push({ name: 'repo', params: { repo: this.$route.params.repo } });
			} catch (e) {
				console.error(e);
				this.error = `Unable to delete tag (${e.message})`;
			}
		},
		async fetchTag() {
			try {
				const r = await tag(this.$route.params.repo, this.$route.params.tag);
				if (r.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json') {
					this.error = 'V2 manifest lists not supported yet';
					return;
				}
				if (r.schemaVersion === 1) {
					r.layers = r.fsLayers.map(l => ({ digest: l.blobSum }));
				}
				this.tag = r;
				this.tagCanDelete = await tagCanDelete(this.$route.params.repo, this.$route.params.tag);

				// extract configuration
				if (r.config.mediaType !== 'application/vnd.docker.container.image.v1+json') {
					this.error = 'configuration mediaType not supported';
				}
				this.config = await configBlob(this.$route.params.repo, r.config.digest);
			} catch (e) {
				console.error(e);
				this.error = `Unable to fetch tag (${e.message})`;
			}
		},
		identifier(t, n) {
			return t.layers[n].digest.split(':')[1].slice(0, 10);
		},
		command() {
			return 'not implemented';
		},
		formatLabels(l) {
			return Object.keys(l).map(k => `${k}: ${l[k]}`).join('\n');
		},
	},
	watch: {
		async $route() {
			await this.fetchTag();
		},
	},
};
</script>
