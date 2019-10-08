<template lang="pug">
  .nav-container.nav-container--sidebar
    .nav-sidebar-column
      .text-center.text-block
        h2 
          b Data Lab
        router-link(to='/')
          img(alt='logo' src="@/assets/images/profile_image.png")
      hr
      .text-block
        ul.menu-vertical
          li
            a.js-scroll-trigger(href='https://seunghyum.github.io' target="_blank") 블로그
          li
            router-link.js-scroll-trigger(to='/finedust') 미세먼지
          li
            router-link.js-scroll-trigger(to='/UEFAtournament') 2019 UEFA Champions League
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
            a(href='mailto:antmgu@gmail.com')
              i.socicon.socicon-mail.icon.icon--xs
          li
            a(href='https://github.com/Seunghyum' target="_blank")
              i.socicon.socicon-github.icon.icon--xs
          li
            a(href='https://www.linkedin.com/in/dave-11096614b' target="_blank")
              i.socicon.socicon-linkedin.icon.icon--xs
    .nav-sidebar-column-toggle.visible-xs.visible-sm(data-toggle-class='.nav-sidebar-column;active')
      i.stack-menu
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