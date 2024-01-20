<template>
  <div>
    <h1>dup1</h1>
    <div class="hd">123</div>
    <van-button v-debounce="handleDebounceClick">防抖按钮</van-button>
    <div v-for="(val,index) in arr"  :key="index">{{ val }}
    <div >
      asdasdasd
    </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      arr:['a','b','c','4','5','6']
    };
  },
  name: "dup",
  methods: {
    handleDebounceClick() {
      const x = 5;
      //debugger;  // 执行会在这里停止
      console.log(x + 1);
      console.log('Debounce button clicked');
    },
    handleThrottleClick() {
      console.log('Throttle button clicked');
    },
  },
  components: {},
};
</script>
<style scoped>
@import "./main.less";
</style>
