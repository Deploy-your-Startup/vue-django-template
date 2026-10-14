import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { initializeConsent } from "./consent";
import App from "./App.vue";
import router from "./router";
import { queryClient } from "./queryClient";
import "./style.css";

void initializeConsent();

createApp(App).use(VueQueryPlugin, { queryClient }).use(router).mount("#app");
