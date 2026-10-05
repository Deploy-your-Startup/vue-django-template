<script setup lang="ts">
import { ref } from "vue";
import { useEntries } from "../composables/useEntries";
const title = ref("");
const { entries, create } = useEntries();
async function submit() {
  await create.mutateAsync(title.value);
  title.value = "";
}
</script>
<template>
  <main class="shell section">
    <p class="eyebrow">Your workspace</p>
    <h1>Dashboard</h1>
    <p>
      A working example: typed API calls, protected writes and automatic cache
      updates.
    </p>
    <form @submit.prevent="submit">
      <label for="entry-title">Entry title</label>
      <input id="entry-title" v-model="title" required maxlength="200" />
      <button class="button" :disabled="create.isPending.value">
        Add entry
      </button>
    </form>
    <p v-if="create.isError.value" role="alert">Could not save the entry.</p>
    <ul aria-label="Entries">
      <li v-for="entry in entries.data.value" :key="entry.id">
        {{ entry.title }}
      </li>
    </ul>
  </main>
</template>
