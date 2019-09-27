<template lang="pug">
  .fine-dust
    h1 미세먼지 페이지
    <router-view/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

export default class Home extends Vue {}
</script>
