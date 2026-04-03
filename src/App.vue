<script setup lang="ts">
import Form from './components/form/Form.vue'
</script>

<template>
  <div class="relative min-h-screen">
    <div
      class="fixed inset-0 -z-10 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-950 dark:to-black"
    ></div>

    <main class="min-h-screen px-4 py-10">
      <div class="mx-auto max-w-2xl">
        <Form />
      </div>
    </main>
  </div>
</template>
