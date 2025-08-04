<template>
    <GoogleMap :center="center" :zoom="12" />
</template>

<script>
import { defineAsyncComponent, ref } from 'vue';

export default {
    components: {
        GoogleMap: defineAsyncComponent(() => import('@/components/GoogleMap.vue'))
    },
    setup() {
        return {}
    }
}
</script>
