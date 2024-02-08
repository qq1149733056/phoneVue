// mixin.js
import { Button ,Swipe, SwipeItem , Grid, GridItem,
  Skeleton,
  SkeletonTitle,
  SkeletonImage,
  SkeletonAvatar,
  SkeletonParagraph,} from 'vant';
import 'vant/lib/index.css';
export default {
  components: {
    [Button.name]: Button,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Skeleton.name]: Skeleton,
    [SkeletonTitle.name]: SkeletonTitle,
    [SkeletonImage.name]: SkeletonImage,
    [SkeletonAvatar.name]: SkeletonAvatar,
    [SkeletonParagraph.name]: SkeletonParagraph,
    // 其他你需要的 Vant 组件
  },
};