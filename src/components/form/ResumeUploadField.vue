<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: File | null
  error?: string
  accept?: string
}>(), {
  error: '',
  accept: '.pdf,.doc,.docx',
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function openPicker() {
  inputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.files?.[0] ?? null)
}

function clearFile() {
  emit('update:modelValue', null)

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}
</script>

<template>
  <div class="space-y-2">
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileChange"
    />

    <button
      type="button"
      :class="[
        'group flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-4 text-left transition-all duration-500 ease-in-out',
        error
          ? 'border-red-300 bg-red-50 hover:bg-red-100'
          : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white',
      ]"
      @click="openPicker"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-500 ease-in-out group-hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="h-4 w-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </div>

        <div>
          <p class="text-sm font-semibold text-slate-800">
            {{ modelValue ? 'Currículo selecionado' : 'Enviar currículo *' }}
          </p>
          <p class="text-xs text-slate-500">
            {{ modelValue ? modelValue.name : 'PDF, DOC ou DOCX até 5 MB' }}
          </p>
        </div>
      </div>

      <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
        {{ modelValue ? 'Trocar arquivo' : 'Escolher arquivo' }}
      </span>
    </button>

    <div class="flex items-center justify-between gap-3">
      <p
        v-if="error"
        class="text-sm text-red-600"
      >
        {{ error }}
      </p>
      <p
        v-else
        class="text-xs text-slate-500"
      >
        Formatos aceitos: PDF, DOC e DOCX.
      </p>

      <button
        v-if="modelValue"
        type="button"
        class="cursor-pointer text-xs font-medium text-slate-600 transition hover:text-slate-900"
        @click="clearFile"
      >
        Remover arquivo
      </button>
    </div>
  </div>
</template>
