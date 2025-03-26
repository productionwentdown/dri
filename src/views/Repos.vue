<template>
  <Layout>
    <template #title>
      <h1>Repositories</h1>
    </template>
    <template #error>
      <Error :message="error" />
    </template>
    <List>
      <template #header>
        <ListHeader>
          <template #title>Repository</template>
          <template #detail>Pull Commmand</template>
        </ListHeader>
      </template>
      <ListItem v-for="repo in repos" :key="repo" :to="{ name: 'repo', params: { repo } }">
        <template #title>
          {{ repo }}
        </template>
        <template #detail>
          <code>docker pull {{ registryHost }}/{{ repo }}</code>
        </template>
      </ListItem>
    </List>
    <Paginator :nextLast="nextLast" />
  </Layout>
</template>

<script>
import { registryHost } from '@/options'
import { repos } from '@/api'

import Layout from '@/components/Layout.vue'
import Error from '@/components/Error.vue'
import List from '@/components/List.vue'
import ListHeader from '@/components/ListHeader.vue'
import ListItem from '@/components/ListItem.vue'
import Paginator from '@/components/Paginator.vue'

export default {
  components: {
    Layout,
    Error,
    List,
    ListHeader,
    ListItem,
    Paginator,
  },
  data() {
    return {
      error: '',
      registryHost: '',
      repos: [],
      nextLast: '',
    }
  },
  async created() {
    this.registryHost = await registryHost()
    await this.fetchRepos()
  },
  methods: {
    async fetchRepos() {
      try {
        const r = await repos(this.$route.query.last)
        this.repos = r.repositories
        this.nextLast = r.nextLast
      } catch (e) {
        console.error(e)
        this.error = `Unable to fetch repositories (${e.message})`
      }
    },
  },
  watch: {
    async $route() {
      await this.fetchRepos()
    },
  },
}
</script>
