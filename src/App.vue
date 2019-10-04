<template lang="pug">
  #app
    navigation
    .main-container.pr-5.pl-5
      router-view
</template>
<script lang="ts">
import Vue from 'vue'
import Navigation from '@/components/common/Navigation.vue';
export default Vue.extend({
  components: {
    Navigation
  }
})
</script>