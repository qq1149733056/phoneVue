// mixin.js
import { Button } from "vant";
export default {
  components: {
    [Button.name]: Button,
    // 其他你需要的 Vant 组件
  },
  mounted() {
    document.title = "登录";
  },
};
