<!--
 * 严肃声明：
 * 开源版本请务必保留此注释头信息，若删除我方将保留所有法律责任追究！
 * 本系统已申请软件著作权，受国家版权局知识产权以及国家计算机软件著作权保护！
 * 可正常分享和学习源码，不得用于违法犯罪活动，违者必究！
 * Copyright (c) 2020 陈尼克 all rights reserved.
 * 版权所有，侵权必究！
 *
-->
<template>
  <div>
    <div class="hread">
      <van-swipe class="my-swipe" :autoplay="3000" lazy-render>
        <van-swipe-item v-for="image in state.mages" :key="image">
          <img :src="image" />
        </van-swipe-item>
      </van-swipe>
    </div>
    <div class="grid">
      <van-grid :column-num="5">
        <van-grid-item
         @click="goToIndex(val)"
          :key="val.categoryId"
          v-for="val in state.categoryList"
          :icon="val.imgUrl"
          :text="val.name"
        />
      </van-grid>
    </div>
    <div class="new_arrival">
      <div>
        <h2>新品上线</h2>
      </div>
      <van-skeleton title :row="3" :loading="state.loading">
        <div class="good-box">
          <div
            class="good-item"
            v-for="(item, index) in state.newGoodses"
            :key="index"
            @click="goToDetail(item)"
          >
            <img :src="item.goodsCoverImg" alt="" />
            <div class="good-desc">
              <div class="title">{{ item.goodsName }}</div>
              <div class="price">¥ {{ item.sellingPrice }}</div>
            </div>
          </div>
        </div>
      </van-skeleton>
    </div>
    <div class="new_arrival">
      <div>
        <h2 v-debounce="()=>showMessage('热门商品')">热门商品</h2>
      </div>
      <van-skeleton title :row="3" :loading="state.loading">
        <div class="good-box"> 
          <div
            class="good-item" 
            v-for="(item, index) in state.newGoodses"
            :key="index"
            @click="goToDetail(item)"
          >
            <img :src="item.goodsCoverImg" alt="" />
            <div class="good-desc">
              <div class="title">{{ item.goodsName }}</div>
              <div class="price">¥ {{ item.sellingPrice }}</div>
            </div>
          </div>
        </div>
      </van-skeleton>
    </div>
  </div>
</template>
<script setup>

import { reactive} from "vue";

const showMessage = (item) => {
  console.log('Start')

let promise = new Promise((resolve) => {
  setTimeout(() => {
      console.log('setTimeout')
    }, 0)
  resolve()
  console.log('Promise')
})

promise.then(() => {
  console.log('Promise then111111111111111')
})

console.log('End');
console.log(item)
}
//图片引用资源为newbee-mall-vue3-app
let goToIndex = (item)=>{
  AlipayJSBridge.call("pushWindow", {
  url: "/home/home_demo.html", // 要打开页面的 URL
    // 打开页面的配置参数
    param: {
      readTitle: true, //自动读取 title
      showOptionMenu: false, // 隐藏右边菜单
      val:item,
    },
  });
};
let goToDetail = (item) => {
  AlipayJSBridge.call("pushWindow", {
  url: "/home/home_about.html", // 要打开页面的 URL
    // 打开页面的配置参数
    param: {
      readTitle: true, //自动读取 title
      showOptionMenu: false, // 隐藏右边菜单
      val:item,
    },
  });
};
const state = new reactive({
  loading: false,
  newGoodses: [
    {
      goodsCoverImg:
        "https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/mate-50-pro-black.png",
      goodsName: "【旗舰新品】HUAWEI/华为Mate50 Pro 昆仑破晓...",
      sellingPrice: "7899",
    },
    {
      goodsCoverImg:
        "https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/iphone-14-pro-purple.jpg",
      goodsName: "【iPhone 14 Pro 暗紫色 512G",
      sellingPrice: "10599",
    },
    {
      goodsCoverImg:
        "https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/mate-50-pro-light.png",
      goodsName: "华为Mate50 Pro 昆仑霞光 512G",
      sellingPrice: "7899",
    },
    {
      goodsCoverImg:
        "https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/mbp-m2-202206.jpg",
      goodsName: "Apple MacBook Pro 13英寸 16G+512...",
      sellingPrice: "10799",
    },
  ],
  mages: [
    "https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/banner-mate60.png",
    "https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/banner-matex5.png",
    "https://newbee-mall.oss-cn-beijing.aliyuncs.com/images/banner-p60-pro-white.png",
  ],
  categoryList: [
    {
      name: "新蜂超市",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E8%B6%85%E5%B8%82%402x.png",
      categoryId: 100001,
    },
    {
      name: "新蜂服饰",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E6%9C%8D%E9%A5%B0%402x.png",
      categoryId: 100003,
    },
    {
      name: "全球购",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E5%85%A8%E7%90%83%E8%B4%AD%402x.png",
      categoryId: 100002,
    },
    {
      name: "新蜂生鲜",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E7%94%9F%E9%B2%9C%402x.png",
      categoryId: 100004,
    },
    {
      name: "新蜂到家",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E5%88%B0%E5%AE%B6%402x.png",
      categoryId: 100005,
    },
    {
      name: "充值缴费",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E5%85%85%E5%80%BC%402x.png",
      categoryId: 100006,
    },
    {
      name: "9.9元拼",
      imgUrl: "https://s.yezgea02.com/1604041127880/9.9%402x.png",
      categoryId: 100007,
    },
    {
      name: "领劵",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E9%A2%86%E5%88%B8%402x.png",
      categoryId: 100008,
    },
    {
      name: "省钱",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E7%9C%81%E9%92%B1%402x.png",
      categoryId: 100009,
    },
    {
      name: "全部",
      imgUrl:
        "https://s.yezgea02.com/1604041127880/%E5%85%A8%E9%83%A8%402x.png",
      categoryId: 100010,
    },
  ],
});

</script>

<style lang="less" scoped>
@import "./main.less";
</style>
