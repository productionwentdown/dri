<template>
    <Layout>
        <h1 slot="title">{{ $route.params.repo }}</h1>
		<Error slot="error" :message='error' />
        <h2>Details</h2>
        <List>
            <ListItem>
                <span slot="title">Full Digest</span>
                <span slot="detail">{{ $route.params.digest }}</span>
            </ListItem>
            <ListItem>
                <span slot="title">Size</span>
                <BlobSize slot="detail" :repo="$route.params.repo" :blob="$route.params.digest" />
            </ListItem>
            </List>
    </Layout>
</template>

<script>
import { blob } from '@/api';

import Layout from '@/components/Layout.vue';
import Error from '@/components/Error.vue';
import List from '@/components/List.vue';
import ListItem from '@/components/ListItem.vue';
import BlobSize from '@/components/BlobSize.vue';

export default {
	components: {
		Layout,
		Error,
		List,
		ListItem,
		BlobSize,
	},
	data() {
		return {
			error: '',
			digest: '',
		};
	},
	async created() {
		await this.fetchBlob();
	},
	methods: {
		async fetchBlob() {
			try {
				const r = await blob(this.$route.params.repo, this.$route.params.digest);
				if (r.dockerContentDigest) {
					this.digest = r.dockerContentDigest;
				}
			} catch (e) {
				console.error(e);
				this.error = `Unable to fetch blob (${e.message})`;
			}
		},
	},
	watch: {
		async $route() {
			await this.fetchBlob();
		},
	},
};
</script>
