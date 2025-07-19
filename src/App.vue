<template>
    <div id="app" class="container">
        <Navbar />
        <router-view />
    </div>
</template>

<script setup>

import Navbar from "./components/layout/Navbar.vue"
import { RouterView } from 'vue-router'

</script>

<style lang="css">
#app {
    max-width: 1280px;
    min-height: 100vh;
    padding: 0 0 5px 5px;
    margin: 0 auto;
    text-align: center;
}

html {
    font-size: 62.5%;
}

body {
    font-family: "Lato";
    font-weight: 400;
}

.roundedcorner {
    border-radius: 15px
}
</style>
