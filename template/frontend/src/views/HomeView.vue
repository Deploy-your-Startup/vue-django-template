<script setup lang="ts">
import { profile } from "../data/profile";
import { RouterLink } from "vue-router";
</script>
<template>
  <main class="shell">
    <section id="home" class="hero">
      <p class="eyebrow">An independent builder</p>
      <h1>{{ profile.headline }}</h1>
      <p class="intro">{{ profile.bio }}</p>
      <a class="button" href="#projects">Explore my work <span>↗</span></a>
    </section>
    <section id="about" class="section">
      <p class="eyebrow">01 / About</p>
      <h2>A little about me.</h2>
      <p>
        Replace this paragraph with your story. The source, infrastructure and
        data are yours.
      </p>
    </section>
    <section id="projects" class="section">
      <p class="eyebrow">02 / Selected work</p>
      <h2>Made with intention.</h2>
      <div class="projects">
        <article v-for="project in profile.projects" :key="project.title">
          <h3>
            <RouterLink :to="`/projects/${project.slug}`">{{
              project.title
            }}</RouterLink>
          </h3>
          <p>{{ project.description }}</p>
          <ul class="tags">
            <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
          </ul>
        </article>
      </div>
    </section>
  </main>
</template>
