// mixin.js
import { Button ,Cell, CellGroup} from "vant";
export default {
  components: {
    [Button.name]: Button,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    // 其他你需要的 Vant 组件
  },
  mounted() {
    document.title = "我的";
  },
};
