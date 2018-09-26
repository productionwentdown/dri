<template>
    <Layout>
        <h1 slot="title">{{ $route.params.repo }}</h1>
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
import Layout from '@/components/Layout.vue';
import List from '@/components/List.vue';
import ListItem from '@/components/ListItem.vue';
import BlobSize from '@/components/BlobSize.vue';

export default {
  components: {
    Layout,
    List,
    ListItem,
    BlobSize,
  },
};
</script>
