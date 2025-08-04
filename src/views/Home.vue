<template>
    <NaturalLanguageInput />
</template>

<script>
import { defineAsyncComponent } from 'vue';

export default {
  components: {
    NaturalLanguageInput: defineAsyncComponent(() => import('@/components/NaturalLanguageInput.vue')),
  }
};
</script>