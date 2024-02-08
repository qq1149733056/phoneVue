<template>
  <div></div>
</template>
<script setup>
AlipayJSBridge.call(
  "getStartupParams",
  function (result) {
    console.log(result);
  }
);
</script>
<style  scoped>
@import "./main.less";
</style>
