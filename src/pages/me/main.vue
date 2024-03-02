<template>
  <div class="main_me">
    <div class="hread">
      <div>
        <img src="https://s.yezgea02.com/1604040746310/aaaddd.png" />
      </div>
      <div class="hread-left">
        <div>昵称:<span>哈哈</span></div>
        <div>登录名:<span>asdasasa</span></div>
        <div>个性签名:<span>哈asaassds哈</span></div>
      </div>
    </div>
    <div class="desc_cell">
      <van-cell @click="getDataN" title="我的订单" is-link />
      <van-cell title="账号管理" is-link />
      <van-cell title="地址管理" is-link />
      <van-cell title="关于我们" is-link />
      <div>
        网络请求测试: {{ state.data.ganmao }}
      </div>
    </div>
  </div>
</template>
<script setup>
import {reactive} from "vue";
let state = reactive({
  data:{},
})
let getDataN = () => {
  var params = [{id:'101030100'}];
  //var operationType = process.env.NODE_ENV;

  AlipayJSBridge.call(
    "rpc",
    {
      operationType: operationType,
      requestData: params,
    },
     (result)=>{
      console.log(result);
      state.data = result.data;
    }
  );
};
</script>
<style lang="less" scoped>
@import "./main.less";
</style>
