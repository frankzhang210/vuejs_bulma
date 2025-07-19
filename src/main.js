import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

import { createPinia } from 'pinia'
app.use(createPinia())

import router from './router'
app.use(router)

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
app.use(Buefy)

import VueGoogleMaps from '@fawmi/vue-google-maps'
app.use(VueGoogleMaps, {
    load: {
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: 'places'
    }
})

import vue3GoogleLogin from 'vue3-google-login'
app.use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

router.isReady().then(() => app.mount('#app'))