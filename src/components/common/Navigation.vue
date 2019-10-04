<template lang="pug">
  .nav-container.nav-container--sidebar
    .nav-sidebar-column
      .text-center.text-block
        a(href='index.html')
          img(alt='logo' src="@/assets/images/profile_image.png")
      hr
      .text-block
        ul.menu-vertical
          //- li
            router-link.js-scroll-trigger(to='/') 홈
          li
            router-link.js-scroll-trigger(to='/finedust') 미세먼지
          //- li.dropdown
            span.dropdown__trigger Elements
            .dropdown__container(style='left: 119.5px;')
              .dropdown__content(style='left: -93.5px;')
                ul.menu-vertical
                  li
                    a(href='elements-accordions.html')
                      | Accordions
                  li
                    a(href='elements-alerts.html')
                      | Alerts
                  li
                    a(href='elements-boxes.html')
                      | Boxes
      
      hr
      div
        ul.social-list.list-inline.list--hover
          li
            a(href='#')
              i.socicon.socicon-google.icon.icon--xs
          li
            a(href='#')
              i.socicon.socicon-github.icon.icon--xs
          li
            a(href='#')
              i.socicon.socicon-linkedin.icon.icon--xs
    .nav-sidebar-column-toggle.visible-xs.visible-sm(data-toggle-class='.nav-sidebar-column;active')
      i.stack-menu

  //- div
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

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
    }
  },
  mounted() {
  }
  
})
</script>