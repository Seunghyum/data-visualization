<template lang="pug">
  #bg-finedust
    .container
      .row
        .col-lg-6
          h1.mt-5 미세먼지 데이터 시각화
          p
            | Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt voluptates rerum eveniet sapiente repellat esse, doloremque quod recusandae deleniti nostrum assumenda vel beatae sed aut modi nesciunt porro quisquam voluptatem.

      .row
        .col-lg-6
          router-link.btn.btn-outline-dark.btn-md.js-scroll-trigger(to='/finedust/sd' @click.prevent="isSdActive=!isSdActive" :class="{ hover: isSdActive }") 시도
          router-link.btn.btn-outline-dark.btn-md.js-scroll-trigger(to='/finedust/sgg' @click.prevent="isSggActive=!isSggActive" :class="{ hover: isSggActive }") 시군구
      
      .finedust-page-wrapper.pt-5.pb-5.pr-5.pl-5.mt-4
        router-view
      .pb-5
</template>
<style lang="scss">
  @import '@/assets/styles/fine-dust.scss';
  #bg-finedust {
    background: url("../assets/images/korea_fine_dust_city.jpg") no-repeat center center fixed;
    min-height: 100vh;
  }
  .finedust-page-wrapper {
    background: rgba(0,0,0,0.3);
  }
</style>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      isSdActive: false,
      isSggActive: false
    }
  },
})
</script>
