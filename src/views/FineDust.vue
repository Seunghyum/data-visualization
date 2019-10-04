<template lang="pug">
  #fine-dust
    .container
      .row
        .col-md-12
          h1.mt-5 
            b 미세먼지 데이터 시각화
          p 
            | 미세먼지 시각화 프로젝트를 진행할 당시 프로젝트에 들어가기전 테스트겸 만들었습니다. <br>
            | D3.js를 활용하여 바닐라 자바스크립트로 짰습니다. <br>
            | SPA지만 URL의 쿼리값을 GET방식으로 접근해도 해당 쿼리의 데이터값에 해당하는 정보를 띄우기 위해 URL을 분석하는 스크립트도 따로 짰습니다.
      br
      .row
        .col-lg-12
          .text-center
            router-link.btn(to='/finedust/sd' @click.prevent active-class="bg--twitter") 시도
            router-link.btn(to='/finedust/sgg' @click.prevent active-class="bg--twitter") 시군구
      
      .finedust-page-wrapper
        router-view
      .pb-5
</template>
<style lang="scss" scope>
  @import '@/assets/styles/fine-dust.scss';
</style>

