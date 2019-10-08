<template lang="pug">
  #fine-dust
    .container
      .row
        .col-md-12
          h3.mt-5 
            b 미세먼지 데이터 시각화
          ul
            li 미세먼지 시각화 프로젝트를 진행할 당시 프로젝트에 들어가기전 테스트 목적으로 만들었습니다. 
            li D3.js과 TopoJson을 활용하였습니다. (<a href="https://github.com/Seunghyum/SGIS-shpToGeojson">SGIS에서 받은 지도데이터(.shp)를 geojson으로 변경하는 작업 내용</a> 참고)
            li SPA지만 URL 쿼리값을 GET방식으로 접근해도 해당 쿼리의 데이터값에 해당하는 정보를 띄우기 위해 URL을 분석하는 스크립트도 따로 짰습니다. 
            li geojson로드시 성능 저하 이슈들은 <a href="https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API">Web Worker</a> 로 백그라운드에서 자바스크립트를 처리하면 부하가 적어진다는 조언을 들었습니다.
            li 시간이 되면 적용해볼 예정입니다.
        hr.short.mx-auto
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

