<template>
  <Layout>
    <template #title>
      <h1>{{ $route.params.repo }}</h1>
    </template>
    <template #error>
      <Error :message="error" />
    </template>
    <template #toolbar>
      <Toolbar>
        <ToolbarButton v-if="repoCanDelete" @click="deleteRepo" danger>Delete</ToolbarButton>
      </Toolbar>
    </template>
    <List>
      <template #header>
        <ListHeader>
          <template #title>Tag</template>
          <template #detail>Pull Commmand</template>
          <template #date>Created</template>
          <template #size>Size</template>
        </ListHeader>
      </template>
      <ListItem v-for="(tag, i) in tags" :key="tag" :to="{ name: 'tag', params: { tag } }">
        <template #title>
          {{ tag }}
        </template>
        <template #detail>
          <code>docker pull {{ registryHost }}/{{ $route.params.repo }}:{{ tag }}</code>
        </template>
        <template #date>
          <time :datetime="dates[i]">
            {{ dates[i].toLocaleString() }}
          </time>
        </template>
        <template #size>
          <TagSize :repo="$route.params.repo" :tag="tag" />
        </template>
      </ListItem>
    </List>
    <Paginator :nextLast="nextLast" />
  </Layout>
</template>

<script>
import { registryHost } from '@/options'
import { tags, repoCanDelete, repoDelete, tag, configBlob } from '@/api'

import Layout from '@/components/Layout.vue'
import Error from '@/components/Error.vue'
import Toolbar from '@/components/Toolbar.vue'
import ToolbarButton from '@/components/ToolbarButton.vue'
import List from '@/components/List.vue'
import ListHeader from '@/components/ListHeader.vue'
import ListItem from '@/components/ListItem.vue'
import Paginator from '@/components/Paginator.vue'
import TagSize from '@/components/TagSize.vue'

export default {
  components: {
    Layout,
    Error,
    Toolbar,
    ToolbarButton,
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
      dates: [],
      repoCanDelete: false,
      nextLast: '',
    }
  },
  async created() {
    this.registryHost = await registryHost()
    await this.fetchTags()
  },
  methods: {
    async deleteRepo() {
      if (!window.confirm(`Are you sure you want to delete ${this.$route.params.repo}?`)) {
        return
      }
      try {
        await repoDelete(this.$route.params.repo)
        this.$router.push({ name: 'repos' })
      } catch (e) {
        console.error(e)
        this.error = `Unable to delete repo (${e.message})`
      }
    },
    async fetchTags() {
      try {
        const r = await tags(this.$route.params.repo, this.$route.query.last)
        this.tags = r.tags
        this.nextLast = r.nextLast
        this.repoCanDelete = await repoCanDelete(this.$route.params.repo)

        // fetch tag dates
        this.dates = await Promise.all(
          r.tags.map(async (tagName) => {
            const t = await tag(this.$route.params.repo, tagName)
            const config = await configBlob(this.$route.params.repo, t.config.digest)
            return new Date(config.created)
          }),
        )
      } catch (e) {
        console.error(e)
        this.error = `Unable to fetch tags (${e.message})`
      }
    },
  },
  watch: {
    async $route() {
      await this.fetchTags()
    },
  },
}
</script>
