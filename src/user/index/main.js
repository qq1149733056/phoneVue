import { createApp } from "vue";
import App from "./main.vue";
import VantMixin from './globalVantMixin';
import debounceThrottleMixin from '@/debounceThrottleMixin'
const app = createApp(App);
app.mixin(VantMixin).mixin(debounceThrottleMixin)
app.mount("#app");
