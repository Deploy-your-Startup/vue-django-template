import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { queryClient } from "../queryClient";
import { login, whoAmI } from "../auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    return to.hash ? { el: to.hash, behavior: "smooth" } : { top: 0 };
  },
  routes: [
    { path: "/", name: "home", component: HomeView },
    {
      path: "/projects/:slug",
      name: "project",
      component: () => import("../views/ProjectView.vue"),
    },
    { path: "/cv", name: "cv", component: () => import("../views/CvView.vue") },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  const identity = await queryClient.fetchQuery({
    queryKey: ["identity"],
    queryFn: whoAmI,
    staleTime: 5 * 60_000,
    retry: false,
  });
  if (identity) return true;
  login(window.location.origin + to.fullPath);
  return false;
});
export default router;
