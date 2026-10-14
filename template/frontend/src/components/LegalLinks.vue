<script setup lang="ts">
import { hasConsentSettings, showConsentSettings } from "../consent";
</script>
<template>
  <nav aria-label="Legal and privacy" class="legal-links">
    <RouterLink to="/impressum">Impressum</RouterLink>
    <RouterLink to="/privacy">Privacy policy</RouterLink>
    <button
      v-if="hasConsentSettings"
      type="button"
      @click="showConsentSettings"
    >
      Privacy settings
    </button>
  </nav>
</template>
<style scoped>
.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
}
button {
  font: inherit;
  color: inherit;
  background: none;
  border: 1px solid currentColor;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
}
</style>
