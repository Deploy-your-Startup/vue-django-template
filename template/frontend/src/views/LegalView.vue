<script setup lang="ts">
import { useRoute } from "vue-router";
import { policy, isPolicyReady } from "../sitePolicy";
const route = useRoute();
</script>
<template>
  <main class="legal-page">
    <h1>{{ route.path === "/impressum" ? "Impressum" : "Privacy policy" }}</h1>
    <p v-if="!isPolicyReady" role="status">
      Draft — operator information and privacy disclosures are incomplete or
      awaiting review. Optional analytics is disabled.
    </p>
    <template v-if="route.path === '/impressum'">
      <h2>Operator</h2>
      <p>{{ policy.operatorName || "Operator name not provided" }}</p>
      <p class="preserve-lines">
        {{ policy.operatorAddress || "Postal address not provided" }}
      </p>
      <p>{{ policy.contactEmail || "Contact email not provided" }}</p>
      <p class="preserve-lines">{{ policy.additionalImprint }}</p>
    </template>
    <template v-else>
      <h2>Controller and contact</h2>
      <p>{{ policy.operatorName }} · {{ policy.contactEmail }}</p>
      <p class="preserve-lines">{{ policy.operatorAddress }}</p>
      <h2>Processing of personal data</h2>
      <p class="preserve-lines">
        {{
          policy.privacyNotice ||
          "Project-specific disclosures have not yet been provided."
        }}
      </p>
      <h2>Privacy choices</h2>
      <p v-if="policy.analytics === 'consent'">
        When enabled, optional Umami analytics loads only after your permission.
        You can change or withdraw that permission using Privacy settings in the
        footer. Withdrawal reloads the page. Do Not Track is respected.
      </p>
      <p v-else>Optional analytics is disabled.</p>
      <p>
        When analytics choices are available, the site_consent cookie saves your
        decision for 180 days. Withdrawal also sets umami.disabled in local
        storage to prevent further collection; accepting analytics again removes
        it. No external consent service receives your choice.
      </p>
    </template>
  </main>
</template>
<style scoped>
.legal-page {
  max-width: 56rem;
  margin: 5rem auto;
  padding: 2rem;
  line-height: 1.7;
}
.preserve-lines {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
[role="status"] {
  border: 1px solid currentColor;
  padding: 1rem;
}
</style>
