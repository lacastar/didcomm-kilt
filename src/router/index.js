// Composables
import { createRouter, createWebHistory } from 'vue-router'
//import  Dashboard from '@/components/Dashboard'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/Dashboard.vue'),
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('@/components/Account.vue'),
  },
  {
    path: '/comm/:room?',
    name: 'Comms',
    props: true,
    component: () => import('@/components/Comms.vue'),
  //  component: Dashboard,
  //  component: () => import('@/components/Dashboard.vue'),
 //   component: () => import('@/layouts/default/Default.vue'),
  //  children: [
  //    {
  //      path: '',
  //      name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
  //      component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
  //    },
  //  ],
  },
  /*{
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login.vue'),
  },*/
  {
    path: '/did',
    name: 'DIDs',
    component: () => import('@/components/Dids.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
