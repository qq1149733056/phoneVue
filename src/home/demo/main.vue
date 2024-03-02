<template>
  <div >
    <h1>{{ state.item.name }}</h1>
  </div>
</template>
<script setup>
import { reactive } from "vue";
const state = new reactive({
  item: {},
});
ready(()=>{
  AlipayJSBridge.call("getStartupParams", (result) => {
    state.item = JSON.parse(result.val);
  });
});
</script>
<style lang="less" scoped>
@import "./main.less";
</style>
