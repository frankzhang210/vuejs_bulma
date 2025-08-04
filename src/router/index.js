import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior: () => ({ y: 0 }), //(to, from, savedPosition)
    routes: [
        { path: '/', title: "Home", redirect: { name: "home" } },
        { path: '/home', name: 'home', component: () => import('@/views/Home.vue') },
        { path: '/weather', name: 'weather', component: () => import('@/views/Weather.vue') },
        { path: '/googlemap', name: 'googlemap', component: () => import('@/views/MapView.vue') },

        { path: '/:pathMatch(.*)*', redirect: '/' }
    ],
})

export default router