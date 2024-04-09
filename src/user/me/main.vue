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
      <van-cell @click="getJs" title="账号管理" is-link />
      <van-cell title="地址管理" is-link />
      <van-cell title="关于我们" is-link />
      <van-uploader v-model="fileList" multiple />
      
      <div>网络请求测试: {{ state.data.ganmao }}</div>
    </div>
  </div>
</template>
<script setup>
import { reactive ,ref} from "vue";

let state = reactive({
  data: {},
});
const fileList = ref([
      { url: 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg' },
      // Uploader 根据文件后缀来判断是否为图片文件
      // 如果图片 URL 中不包含类型信息，可以添加 isImage 标记来声明
      { url: 'https://fastly.jsdelivr.net/npm/@vant/assets/leaf.jpeg' },
    ]);

let getJs = () => {
  AlipayJSBridge.call(
    "myapi",
    {
      param1: "Waaaa",
      param2: "World",
    },
    function (result) {
      console.log(result);
    }
  );
};
 let timeOut = async ()=>{
    console.log('111');
 };
timeOut().then(res=>{
  console.log('222')
})
let pr = () => {
  
  return new Promise((resolve, reject) => {
    let params = [{ id: "101030100" }];
    let operationType = process.env.VUE_APP_MPASS;
    AlipayJSBridge.call(
      "rpc",
      {
        operationType: operationType,
        requestData: params,
      },
      (result) => {
        if (result.status === 200) {
          resolve(result.data);
        } else {
          reject(result.data.status);
        }
      }
    );
  });
};

let getDataN = () => {
  pr().then(
    (res) => {
      console.log("res", res);
      state.data = res
    },
    (rej) => {
      console.log(rej);
    }
  );
};
</script>
<style lang="less" scoped>
@import "./main.less";
</style>
