// mixin.js
import { Sidebar, SidebarItem ,ConfigProvider,Grid, GridItem } from 'vant';
export default {
  components: {
    [Sidebar.name]: Sidebar,
    [SidebarItem.name]: SidebarItem,
    [ConfigProvider.name]:ConfigProvider,
    [Grid.name]:Grid,
    [GridItem.name]:GridItem,
    // 其他你需要的 Vant 组件
  },
  mounted(){
    document.title = "分类";
  }
};