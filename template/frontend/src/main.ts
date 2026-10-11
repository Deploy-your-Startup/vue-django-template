import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { loadKpis } from "./kpis";
import App from "./App.vue";
import router from "./router";
import { queryClient } from "./queryClient";
import "./style.css";

loadKpis();

createApp(App).use(VueQueryPlugin, { queryClient }).use(router).mount("#app");
