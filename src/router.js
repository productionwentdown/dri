import Vue from 'vue';
import Router from 'vue-router';

import Repos from '@/views/Repos.vue';
import Repo from '@/views/Repo.vue';
import Tag from '@/views/Tag.vue';
import Blob from '@/views/Blob.vue';

Vue.use(Router);

export default new Router({
  //mode: 'history',
  routes: [
    {
      path: '/',
      name: 'repos',
      component: Repos,
    },
    {
      path: '/:repo+/blobs/:digest',
      name: 'blob',
      component: Blob,
    },
    {
      path: '/:repo+/tags/:tag',
      name: 'tag',
      component: Tag,
    },
    {
      path: '/:repo+',
      name: 'repo',
      component: Repo,
    },
  ],
});
