import Vue from 'vue';
import Router from 'vue-router';

import Repos from '@/views/Repos.vue';
import Repo from '@/views/Repo.vue';
import Tag from '@/views/Tag.vue';
import Blob from '@/views/Blob.vue';

Vue.use(Router);

const removeEncode = (to, _, next) => {
	if (to.path.indexOf('%2F') > -1) {
		return next({
			path: to.path.replace('%2F', '/'),
		});
	}
	return next();
};

export default new Router({
	// mode: 'history',
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
});
