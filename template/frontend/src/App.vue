<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useAuth } from "./composables/useAuth";
import { profile } from "./data/profile";
import { useHealth } from "./composables/useHealth";
const { data, isError } = useHealth();
const { identity, login, logout, isLoading } = useAuth();
</script>

<template>
  <header class="shell navigation">
    <RouterLink class="brand" to="/">{{ profile.name }}</RouterLink>
    <nav aria-label="Main">
      <RouterLink to="/#about">About</RouterLink
      ><RouterLink to="/#projects">Projects</RouterLink
      ><RouterLink to="/cv">CV</RouterLink
      ><RouterLink v-if="identity" to="/dashboard">Dashboard</RouterLink
      ><a :href="profile.github" rel="noopener">GitHub ↗</a>
      <button v-if="identity" @click="logout">Log out</button>
      <button v-else-if="!isLoading" @click="login()">Log in</button>
    </nav>
  </header>
  <RouterView />
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
