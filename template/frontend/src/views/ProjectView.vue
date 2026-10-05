<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { profile } from "../data/profile";
const route = useRoute();
const project = computed(() =>
  profile.projects.find((item) => item.slug === route.params.slug),
);
</script>
<template>
  <main class="shell section">
    <template v-if="project">
      <p class="eyebrow">Selected work</p>
      <h1>{{ project.title }}</h1>
      <p>{{ project.description }}</p>
      <ul class="tags">
        <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
      </ul>
    </template>
    <h1 v-else>Project not found</h1>
    <RouterLink to="/#projects">Back to projects</RouterLink>
  </main>
</template>
