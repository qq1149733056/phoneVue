// mixin.js
import { Button, List } from 'vant';
import 'vant/lib/button/style';
import 'vant/lib/list/style';
export default {
  components: {
    [Button.name]: Button,
    [List.name]: List,
    // 其他你需要的 Vant 组件
  },
};