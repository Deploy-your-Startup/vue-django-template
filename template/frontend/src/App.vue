<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { login, logout, whoAmI } from "./auth";
import { profile } from "./data/profile";
import { useHealth } from "./composables/useHealth";
const { data, isError } = useHealth();
const { data: identity } = useQuery({
  queryKey: ["identity"],
  queryFn: whoAmI,
  retry: false,
});
</script>

<template>
  <header class="shell navigation">
    <a class="brand" href="#home">{{ profile.name }}</a>
    <nav aria-label="Main">
      <a href="#about">About</a><a href="#projects">Projects</a
      ><a :href="profile.github" rel="noopener">GitHub ↗</a>
      <button v-if="identity" @click="logout">Log out</button>
      <button v-else @click="login()">Log in</button>
    </nav>
  </header>
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
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <ul class="tags">
            <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
          </ul>
        </article>
      </div>
    </section>
  </main>
  <footer class="shell">
    <span>{{ profile.name }}</span>
    <p role="status">
      {{
        data?.status === "ok"
          ? "Backend connected"
          : isError
            ? "Backend unavailable"
            : "Connecting to backend…"
      }}
    </p>
  </footer>
</template>
