<script setup lang="ts">
import { profile } from "../data/profile";
</script>
<template>
  <main class="shell section">
    <p class="eyebrow">Experience</p>
    <h1>{{ profile.name }} / CV</h1>
    <article v-for="item in profile.experience" :key="item.title">
      <h2>{{ item.title }}</h2>
      <p>{{ item.description }}</p>
    </article>
  </main>
</template>
