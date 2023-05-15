import {createRouter, createWebHashHistory} from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },
    {
      path: '/servers',
      name: 'server-list',
      component: () => import('../views/Servers.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue')
    },
  ]
});

export default router;
