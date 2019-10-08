import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import PageNotFound404 from '@/views/PageNotFound404.vue';
import FineDust from '@/views/FineDust.vue';
// import FineDustIndex from './components/FineDust/Index.vue';
import FineDustSd from '@/components/FineDust/Sd.vue';
import FineDustSgg from '@/components/FineDust/Sgg.vue';
import UEFAtournament from '@/views/UEFAtournament.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      // component: Home,
      component: FineDust,
    },
    {
      path: '/finedust',
      component: FineDust,
      children: [
        {
          path: 'sd',
          component: FineDustSd
        },
        {
          path: 'sgg',
          component: FineDustSgg
        }
      ]
    },
    {
      path: '/UEFAtournament',
      name: 'UEFAtournament',
      component: UEFAtournament,
    },
    { path: "*", component: PageNotFound404 }
  ],
});
