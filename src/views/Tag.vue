<template>
  <Layout>
    <template #title>
      <h1>{{ $route.params.repo }}:{{ $route.params.tag }}</h1>
    </template>
    <template #error>
      <Error :message="error" />
    </template>
    <template #toolbar>
      <Toolbar>
        <ToolbarButton v-if="tagCanDelete" @click="deleteTag" danger>Delete</ToolbarButton>
      </Toolbar>
    </template>
    <h2>Details</h2>
    <List>
      <ListItem>
        <template #title>Schema Version</template>
        <template #detail>{{ tag.schemaVersion }}</template>
      </ListItem>
      <ListItem>
        <template #title>Full Digest</template>
        <template #detail>{{ tag.headers.get('Docker-Content-Digest') }}</template>
      </ListItem>
      <ListItem>
        <template #title>Date Created</template>
        <template #date>{{ new Date(config.created).toLocaleString() }}</template>
      </ListItem>
      <ListItem>
        <template #title>Platform</template>
        <template #detail>{{ config.os }} {{ config.architecture }}</template>
      </ListItem>
      <ListItem>
        <template #title>Entrypoint</template>
        <template #detail>
          <code>{{ config.config.Entrypoint }}</code>
        </template>
      </ListItem>
      <ListItem>
        <template #title>Command</template>
        <template #detail>
          <code>{{ config.config.Cmd }}</code>
        </template>
      </ListItem>
      <ListItem>
        <template #title>Labels</template>
        <template #detail>
          <ul style="text-align: left; list-style: none">
            <li v-for="(v, k) in config.config.Labels" :key="k">
              <code>{{ k }}: {{ v }}</code>
            </li>
          </ul>
        </template>
      </ListItem>
      <ListItem>
        <template #title>Layers</template>
        <template #size>{{ tag.layers.length }}</template>
      </ListItem>
      <ListItem>
        <template #title>Size</template>
        <template #size>
          <TagSize :repo="$route.params.repo" :tag="$route.params.tag" />
        </template>
      </ListItem>
    </List>
    <h2>Layers</h2>
    <List>
      <template #header>
        <ListHeader>
          <template #title>Digest</template>
          <template #detail>Summary</template>
          <template #size>Size</template>
        </ListHeader>
      </template>
      <ListItem
        v-for="(layer, i) in tag.layers"
        :key="i"
        :to="{ name: 'blob', params: { repo: $route.params.repo, digest: layer.digest } }"
      >
        <template #title>
          <span :title="layer.digest">
            {{ identifier(layer.digest) }}
          </span>
        </template>
        <template #detail>
          <span :title="config.history[i].created_by">
            {{ summary(config.history[i].created_by) }}
          </span>
        </template>
        <template #size>
          <BlobSize :size="layer.size" />
        </template>
      </ListItem>
    </List>
  </Layout>
</template>

<script>
import { registryHost } from '@/options'
import { tag, tagCanDelete, tagDelete, configBlob } from '@/api'

import Layout from '@/components/Layout.vue'
import Error from '@/components/Error.vue'
import Toolbar from '@/components/Toolbar.vue'
import ToolbarButton from '@/components/ToolbarButton.vue'
import List from '@/components/List.vue'
import ListHeader from '@/components/ListHeader.vue'
import ListItem from '@/components/ListItem.vue'
import TagSize from '@/components/TagSize.vue'
import BlobSize from '@/components/BlobSize.vue'

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
      tag: {},
      config: {},
      tagCanDelete: false,
      layers: [],
    }
  },
  async created() {
    this.registryHost = await registryHost()
    await this.fetchTag()
  },
  methods: {
    async deleteTag() {
      if (
        !window.confirm(
          `Are you sure you want to delete ${this.$route.params.repo}:${this.$route.params.tag}?`,
        )
      ) {
        return
      }
      try {
        await tagDelete(this.$route.params.repo, this.$route.params.tag)
        this.$router.push({ name: 'repo', params: { repo: this.$route.params.repo } })
      } catch (e) {
        console.error(e)
        this.error = `Unable to delete tag (${e.message})`
      }
    },
    async fetchTag() {
      try {
        const r = await tag(this.$route.params.repo, this.$route.params.tag)
        if (r.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json') {
          this.error = 'V2 manifest lists not supported yet'
          return
        }
        if (r.schemaVersion === 1) {
          r.layers = r.fsLayers.map((l) => ({ digest: l.blobSum }))
        }
        this.tag = r
        this.tagCanDelete = await tagCanDelete(this.$route.params.repo, this.$route.params.tag)

        // extract configuration
        if (r.config.mediaType !== 'application/vnd.docker.container.image.v1+json') {
          this.error = 'configuration mediaType not supported'
        }
        this.config = await configBlob(this.$route.params.repo, r.config.digest)
      } catch (e) {
        console.error(e)
        this.error = `Unable to fetch tag (${e.message})`
      }
    },
    identifier(digest) {
      return digest.split(':')[1].slice(0, 10)
    },
    summary(createdBy) {
      return createdBy.slice(0, 80)
    },
    formatLabels(l) {
      return Object.keys(l)
        .map((k) => `${k}: ${l[k]}`)
        .join('\n')
    },
  },
  watch: {
    async $route() {
      await this.fetchTag()
    },
  },
}
</script>
