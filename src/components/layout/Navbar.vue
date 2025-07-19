<template>
    <nav class="navbar has-shadow">
        <div class="container">
            <div class="navbar-brand">
                <router-link class="navbar-item" to="/home">
                    <img src="/vite.svg" width="112" height="28">
                </router-link>
                <div class="navbar-burger burger" @click="isActive = !isActive" :class="{ 'is-active': isActive }">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div class="navbar-menu" :class="{ 'is-active': isActive }">
                <div class="navbar-start">
                    <router-link to="/home" class="navbar-item"> Weather Forcast </router-link>
                    <router-link to="/googlemap" class="navbar-item"> Google Map </router-link>
                </div>

                <div class="navbar-end">
                    <div class="navbar-item" v-if="!isLoggedIn">
                        <GoogleLogin :callback="handleLogin" />
                    </div>
                    <div class="navbar-item has-dropdown is-hoverable" v-else>
                        <div class="navbar-link">
                            <figure class="image is-32x32 mr-2">
                                <img class="is-rounded" :src="userPicture" v-if="userPicture">
                                <img class="is-rounded" src="@/assets/user_placeholder.svg" v-else>
                            </figure>
                            <span>{{ userName }}</span>
                        </div>
                        <div class="navbar-dropdown">
                            <a class="navbar-item" @click="handleLogout">
                                Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import { RouterLink } from 'vue-router'
import router from '@/router'
import { ref, computed, onMounted } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import { useUserStore } from '@/stores/user.module'

export default {
    components: { GoogleLogin },
    setup() {
        const isActive = ref(false)
        const userStore = useUserStore()

        // Check authentication status on component mount
        onMounted(() => {
            userStore.checkAuth()
        })

        const handleLogin = (response) => {
            userStore.loginWithGoogle(response)
        }

        const handleLogout = () => {
            userStore.logout()
        }

        return {
            isActive,
            isLoggedIn: computed(() => userStore.isLoggedIn),
            userName: computed(() => userStore.userName),
            userPicture: computed(() => userStore.userPicture),
            handleLogin,
            handleLogout
        }
    }
}
</script>