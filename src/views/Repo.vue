<template>
    <Layout>
        <h1 slot="title">{{ $route.params.repo }}</h1>
        <Error slot="error" :message='error' />
        <List>
            <ListHeader slot="header">
                <span slot="title">Tag</span>
                <span slot="detail">Pull Commmand</span>
                <span slot="size">Size</span>
            </ListHeader>
            <ListItem
                v-for="tag in tags"
                :key="tag"
                :to="{ name: 'tag', params: { tag, }}">
                <span slot="title">
                    {{ tag }}
                </span>
                <span slot="detail">
                    <code>docker pull {{ registryHost }}/{{ $route.params.repo }}:{{ tag }}</code>
                </span>
                <TagSize slot="size" :repo="$route.params.repo" :tag="tag" />
            </ListItem>
        </List>
        <Paginator :nextLast="nextLast" />
    </Layout>
</template>

<script>
import { registryHost } from '@/options';
import { tags } from '@/api';

import Layout from '@/components/Layout.vue';
import Error from '@/components/Error.vue';
import Toolbar from '@/components/Toolbar.vue';
import List from '@/components/List.vue';
import ListHeader from '@/components/ListHeader.vue';
import ListItem from '@/components/ListItem.vue';
import Paginator from '@/components/Paginator.vue';
import TagSize from '@/components/TagSize.vue';

export default {
  components: {
    Layout,
    Error,
    Toolbar,
    List,
    ListHeader,
    ListItem,
    Paginator,
    TagSize,
  },
  data() {
    return {
      error: '',
      registryHost: '',
      tags: [],
      nextLast: '',
    };
  },
  async created() {
    this.registryHost = await registryHost();
    await this.fetchTags();
  },
  methods: {
    async fetchTags() {
      try {
        const r = await tags(this.$route.params.repo, this.$route.query.last);
        this.tags = r.tags;
        this.nextLast = r.nextLast;
      } catch (e) {
        console.error(e);
        this.error = `Unable to fetch tags (${e.name})`;
      }
    },
  },
  watch: {
    async $route() {
      await this.fetchTags();
    },
  },
};
</script>
