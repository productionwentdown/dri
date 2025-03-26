import { createRouter, createWebHashHistory } from 'vue-router'

import Repos from '@/views/Repos.vue'
import Repo from '@/views/Repo.vue'
import Tag from '@/views/Tag.vue'
import Blob from '@/views/Blob.vue'

const removeEncode = (to, _, next) => {
  if (to.path.indexOf('%2F') > -1) {
    return next({
      path: to.path.replace('%2F', '/'),
    })
  }
  return next()
}

export default createRouter({
  history: createWebHashHistory(),
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
      beforeEnter: removeEncode,
    },
    {
      path: '/:repo+/tags/:tag',
      name: 'tag',
      component: Tag,
      beforeEnter: removeEncode,
    },
    {
      path: '/:repo+',
      name: 'repo',
      component: Repo,
      beforeEnter: removeEncode,
    },
  ],
})
