<template>
  <div id="app">
    <navigation/>
    <router-view/>
  </div>
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