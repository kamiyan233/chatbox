import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta:{
      title:'home',
      showTabbar:true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta:{
      title:'登录'
    }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/signup.vue'),
    meta:{
      title:'注册'
    }
  },
  {
    path: '/mine',
    name: 'Mine',
    meta:{
      title:'我的',
      showTabbar:true
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Mine.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
