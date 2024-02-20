<template>
  <div class="about">
    <div class="hread">
      <img :src="state.item.goodsCoverImg" />
    </div>
    <div class="about_mian">
      <div>
        <div class="title">{{ state.item.goodsName }}</div>
        <div class="sub_title">免邮费 顺丰快递</div>
        <div class="money">
          {{ state.item.sellingPrice }}
        </div>
        <ul class="list">
          <li>概述</li>
          <li>参数</li>
          <li>安装服务</li>
          <li>常见问题</li>
        </ul>
        <div class="prouduct">
          <img
            src="https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/mate-50-pro-1.jpg"
          />
        </div>
      </div>
    </div>
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
