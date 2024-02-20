// mixin.js
import { Button, List } from 'vant';
export default {
  components: {
    [Button.name]: Button,
    [List.name]: List,
    // 其他你需要的 Vant 组件
  },
  mounted(){
    document.title = "产品详情";
  }
};