<template>
  <div >

  </div>
</template>
<script setup>
   let demo = (obj,name='aaa',age=19)=>{
      console.log(name);
      console.log(age);
   }
 let obj = {};
 demo(obj,obj.name,obj.age);
</script>
<style lang="less" scoped>
@import "./main.less";
</style>
