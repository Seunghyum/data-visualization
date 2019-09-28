<template lang="pug">
  div
    a.menu-toggle.rounded(href='#' @click.prevent="isActive=!isActive" :class="{ active: isActive }")
      i.fas.fa-bars(v-if="!isActive")
      i.fas.fa-times(v-else)
    nav#sidebar-wrapper(:class="{ active: isActive }")
      ul.sidebar-nav
        li.sidebar-brand(@click="isActive=false")
          router-link.js-scroll-trigger(to='/') 홈
        li.sidebar-nav-item(@click="isActive=false")
          router-link.js-scroll-trigger(to='/finedust') 미세먼지

</template>

<style lang="scss">
  @import "@/assets/styles/navigation.scss";
</style>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      isActive: false,
    }
  },
  mounted() {

    // // Closes the sidebar menu
    // document.querySelector(".menu-toggle").click(function(e) {
    //   e.preventDefault();
    //   console.log("sdasdas")
    //   document.querySelector("#sidebar-wrapper").classList.toggle("active");
    //   document.querySelector(".menu-toggle > .fa-bars, .menu-toggle > .fa-times").classList.toggle("fa-bars fa-times");
    //   document.querySelector(this).classList.toggle("active");
    // });
  }
  
})
</script>