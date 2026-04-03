<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { normalizeSearchValue } from '../../shared/formValidation'

const props = withDefaults(defineProps<{
  id: string
  modelValue: string[]
  options: string[]
  placeholder: string
  emptyMessage: string
  disabled?: boolean
  error?: string
}>(), {
  disabled: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const search = ref('')
const activeIndex = ref(-1)

const filteredOptions = computed(() => {
  const normalizedQuery = normalizeSearchValue(search.value)

  if (!normalizedQuery) {
    return props.options
  }

  return props.options.filter((option) => normalizeSearchValue(option).includes(normalizedQuery))
})

const listboxId = computed(() => `${props.id}-listbox`)
const errorId = computed(() => `${props.id}-error`)

watch(
  () => props.options,
  (nextOptions) => {
    emit(
      'update:modelValue',
      props.modelValue.filter((item) => nextOptions.includes(item)),
    )

    if (activeIndex.value >= filteredOptions.value.length) {
      activeIndex.value = filteredOptions.value.length - 1
    }
  },
)

watch(isOpen, async (open) => {
  if (!open) {
    search.value = ''
    activeIndex.value = -1
    return
  }

  activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1
  await nextTick()
  inputRef.value?.focus()
})

function updateModelValue(nextValue: string[]) {
  emit('update:modelValue', nextValue)
}

function openDropdown() {
  if (props.disabled) {
    return
  }

  isOpen.value = true
}

function closeDropdown() {
  isOpen.value = false
}

function toggleDropdown() {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value
}

function focusInput() {
  if (props.disabled) {
    return
  }

  openDropdown()
  inputRef.value?.focus()
}

function toggleOption(option: string) {
  const nextValue = props.modelValue.includes(option)
    ? props.modelValue.filter((item) => item !== option)
    : [...props.modelValue, option]

  updateModelValue(nextValue)
  search.value = ''
  activeIndex.value = filteredOptions.value.indexOf(option)
  inputRef.value?.focus()
}

function removeOption(option: string) {
  updateModelValue(props.modelValue.filter((item) => item !== option))
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node

  if (rootRef.value && !rootRef.value.contains(target)) {
    closeDropdown()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      openDropdown()
      activeIndex.value = Math.min(activeIndex.value + 1, filteredOptions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      openDropdown()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      break
    case 'Enter':
      if (!isOpen.value || activeIndex.value < 0) {
        return
      }

      event.preventDefault()
      {
        const activeOption = filteredOptions.value[activeIndex.value]

        if (activeOption) {
          toggleOption(activeOption)
        }
      }
      break
    case 'Escape':
      closeDropdown()
      break
    case 'Backspace':
      if (!search.value && props.modelValue.length > 0) {
        const lastSelectedOption = props.modelValue[props.modelValue.length - 1]

        if (lastSelectedOption) {
          removeOption(lastSelectedOption)
        }
      }
      break
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <div
      :class="[
        'flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-slate-800 transition',
        disabled ? 'cursor-not-allowed' : 'cursor-text focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200',
        error ? 'border-red-400 ring-1 ring-red-200 focus-within:border-red-400 focus-within:ring-red-100' : '',
      ]"
      @click="focusInput"
    >
      <span
        v-for="item in modelValue"
        :key="item"
        class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
      >
        {{ item }}
        <button
          type="button"
          class="cursor-pointer font-semibold text-slate-500 transition hover:text-slate-900"
          :aria-label="`Remover ${item}`"
          @click.stop="removeOption(item)"
        >
          ×
        </button>
      </span>

      <input
        :id="id"
        ref="inputRef"
        v-model="search"
        type="text"
        :disabled="disabled"
        :placeholder="placeholder"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? errorId : undefined"
        aria-autocomplete="list"
        class="min-w-32 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        @focus="openDropdown"
        @keydown="handleKeydown"
        @click.stop
      />

      <button
        type="button"
        class="ml-auto cursor-pointer text-xs text-slate-500 disabled:cursor-not-allowed disabled:text-slate-400"
        :disabled="disabled"
        :aria-label="isOpen ? 'Fechar opções' : 'Abrir opções'"
        @click.stop="toggleDropdown"
      >
        {{ isOpen ? 'Fechar' : 'Abrir' }}
      </button>
    </div>

    <p
      v-if="error"
      :id="errorId"
      class="mt-1 text-sm text-red-600"
    >
      {{ error }}
    </p>

    <div
      v-if="isOpen"
      :id="listboxId"
      role="listbox"
      aria-multiselectable="true"
      class="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
    >
      <button
        v-for="(item, index) in filteredOptions"
        :key="item"
        type="button"
        role="option"
        :aria-selected="modelValue.includes(item)"
        :class="[
          'flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm transition',
          index === activeIndex ? 'bg-slate-100' : 'hover:bg-slate-50',
        ]"
        @mouseenter="activeIndex = index"
        @click="toggleOption(item)"
      >
        <span>{{ item }}</span>
        <span v-if="modelValue.includes(item)" class="text-slate-700">Selecionada</span>
      </button>

      <p
        v-if="filteredOptions.length === 0"
        class="px-3 py-2 text-sm text-slate-400"
      >
        {{ emptyMessage }}
      </p>
    </div>
  </div>
</template>
