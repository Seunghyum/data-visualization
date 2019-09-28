import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import PageNotFound404 from '@/views/PageNotFound404.vue';
import FineDust from '@/views/FineDust.vue';
// import FineDustIndex from './components/FineDust/Index.vue';
import FineDustSd from '@/components/FineDust/Sd.vue';
import FineDustSgg from '@/components/FineDust/Sgg.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/finedust',
      component: FineDust,
      children: [
        // {
        //   path: '',
        //   component: FineDustIndex
        // },
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
    { path: "*", component: PageNotFound404 }
  ],
});
