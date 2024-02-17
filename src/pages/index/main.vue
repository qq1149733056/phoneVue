<template>
  <div class="page_index">
    <div>
      <van-config-provider theme-vars-scope="global">
        <van-sidebar v-model="state.active" @change="onChange">
          <van-sidebar-item
            v-for="(item, index) in state.list"
            :key="index"
            :title="item.name"
          />
        </van-sidebar>
      </van-config-provider>
    </div>
    <div class="right_mian">
      <div class="right_mian_top">
        {{ state.subName }}
      </div>
      <van-grid>
        <van-grid-item @click="gotoDetail(item)" v-for="(item,index) in state.phone" :key="index" icon="photo-o" :text="item.name" />
      </van-grid>
    </div>
  </div>
</template>
<script setup>
import { reactive } from "vue";
let gotoDetail = (item) => {
  console.log(item);
};
let state = new reactive({
  active: 1,
  subName: "数码",
  phone:[{
    name:"华为手机"
  },{
    name:"华为 P30"
  },{
    name:"iPhone 11"
  },{
    name:"苹果 iPhone"
  },{
    name:"华为 Mate 20"
  },{
    name:"小米手机"
  },{
    name:"OPPO"
  },{
    name:"小米 MIX"
  }],
  list: [
    {
      name: "家电",
    },
    {
      name: "数码",
    },
    {
      name: "运动",
    },
  ],
});
let onChange = (index) => {
  state.subName = state.list[index].name;
};
</script>
<style lang="less" scoped>
@import "./main.less";
</style>
