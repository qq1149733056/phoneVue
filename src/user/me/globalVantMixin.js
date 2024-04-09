// mixin.js
import { Button ,Cell, CellGroup,Uploader } from "vant";
export default {
  components: {
    [Button.name]: Button,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Uploader.name]: Uploader,
    // 其他你需要的 Vant 组件
  },
  mounted() {
    document.title = "我的";
  },
};
