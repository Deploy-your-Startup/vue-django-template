import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";
import router from "./router";
import { queryClient } from "./queryClient";
import "./style.css";

createApp(App).use(VueQueryPlugin, { queryClient }).use(router).mount("#app");
