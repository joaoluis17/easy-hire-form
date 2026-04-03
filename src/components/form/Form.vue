<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DarkModeToggle from '../DarkModeToggle.vue'
import { formConfig } from '../../config/formConfig'

const OTHER_OPTION = 'Outra'

const name = ref('')
const email = ref('')
const phone = ref('')
const areas = ref<string[]>([])
const crafts = ref<string[]>([])
const linkedin = ref('')
const portfolio = ref('')
const message = ref('')
const resume = ref<File | null>(null)
const selectedCountry = ref('BR')
const isAreasOpen = ref(false)
const isCraftsOpen = ref(false)
const areaSearch = ref('')
const craftSearch = ref('')
const resumeInputRef = ref<HTMLInputElement | null>(null)
const areasDropdownRef = ref<HTMLElement | null>(null)
const craftsDropdownRef = ref<HTMLElement | null>(null)

const availableCrafts = computed(() => {
  const uniqueCrafts = new Set<string>()

  for (const selectedArea of areas.value) {
    for (const craft of formConfig.craftsByArea[selectedArea] ?? []) {
      uniqueCrafts.add(craft)
    }
  }

  uniqueCrafts.add(OTHER_OPTION)

  return Array.from(uniqueCrafts)
})

const filteredAreas = computed(() => {
  const query = areaSearch.value.trim().toLowerCase()
  const allAreas = [...formConfig.areas, OTHER_OPTION]

  if (!query) {
    return allAreas
  }

  return allAreas.filter((item) => item.toLowerCase().includes(query))
})

const filteredCrafts = computed(() => {
  const query = craftSearch.value.trim().toLowerCase()

  if (!query) {
    return availableCrafts.value
  }

  return availableCrafts.value.filter((item) => item.toLowerCase().includes(query))
})

const countries = [
  { code: 'BR', label: 'Brasil (+55)', dialCode: '+55' },
  { code: 'US', label: 'Estados Unidos (+1)', dialCode: '+1' },
  { code: 'PT', label: 'Portugal (+351)', dialCode: '+351' },
  { code: 'AR', label: 'Argentina (+54)', dialCode: '+54' },
]

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

watch(availableCrafts, (nextCrafts) => {
  crafts.value = crafts.value.filter((selectedCraft) => nextCrafts.includes(selectedCraft))
})

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node

  if (areasDropdownRef.value && !areasDropdownRef.value.contains(target)) {
    isAreasOpen.value = false
  }

  if (craftsDropdownRef.value && !craftsDropdownRef.value.contains(target)) {
    isCraftsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  resume.value = target.files?.[0] ?? null
}

function openResumePicker() {
  resumeInputRef.value?.click()
}

function clearResume() {
  resume.value = null

  if (resumeInputRef.value) {
    resumeInputRef.value.value = ''
  }
}

async function handleSubmit() {
  if (areas.value.length === 0) {
    errorMessage.value = 'Selecione pelo menos uma area.'
    return
  }

  if (crafts.value.length === 0) {
    errorMessage.value = 'Selecione pelo menos uma funcao.'
    return
  }

  if (!message.value.trim()) {
    errorMessage.value = 'Preencha a mensagem.'
    return
  }

  if (!resume.value) {
    errorMessage.value = 'Envie seu curriculo.'
    return
  }

  try {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('email', email.value)
    formData.append('phoneCountry', selectedCountry.value)
    formData.append('phone', phone.value)
    formData.append('phoneDigits', getPhoneDigits(phone.value))
    formData.append('areas', JSON.stringify(areas.value))
    formData.append('crafts', JSON.stringify(crafts.value))
    formData.append('linkedin', linkedin.value)
    formData.append('portfolio', portfolio.value)
    formData.append('message', message.value)

    if (resume.value) {
      formData.append('resume', resume.value)
    }

    const response = await fetch(formConfig.apiUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Falha ao enviar formulario.')
    }

    successMessage.value = 'Candidatura enviada com sucesso!'
  } catch (error) {
    errorMessage.value = 'Nao foi possivel enviar sua candidatura.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleNameInput(event: Event) {
  const target = event.target as HTMLInputElement

  let value = target.value
  value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '')
  value = value.slice(0, 80)

  name.value = value
}

function handleEmailInput(event: Event) {
  const target = event.target as HTMLInputElement

  let value = target.value
  value = value.replace(/\s/g, '')
  value = value.toLowerCase()
  value = value.slice(0, 120)

  email.value = value
}

function formatBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatUSPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function formatPortugalPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

function formatArgentinaPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
}

function formatPhoneByCountry(value: string, countryCode: string) {
  switch (countryCode) {
    case 'BR':
      return formatBrazilPhone(value)
    case 'US':
      return formatUSPhone(value)
    case 'PT':
      return formatPortugalPhone(value)
    case 'AR':
      return formatArgentinaPhone(value)
    default:
      return value.replace(/[^\d\s()-]/g, '')
  }
}

function handlePhoneInput(event: Event) {
  const target = event.target as HTMLInputElement

  let digits = target.value.replace(/\D/g, '')
  let maxLength = 15

  switch (selectedCountry.value) {
    case 'BR':
      maxLength = 11
      break
    case 'US':
      maxLength = 10
      break
    case 'PT':
      maxLength = 9
      break
    case 'AR':
      maxLength = 10
      break
  }

  digits = digits.slice(0, maxLength)
  phone.value = formatPhoneByCountry(digits, selectedCountry.value)
}

function handleCountryChange() {
  phone.value = ''
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, '')
}

function toggleAreasDropdown() {
  isAreasOpen.value = !isAreasOpen.value
  if (isAreasOpen.value) {
    isCraftsOpen.value = false
  }
}

function toggleCraftsDropdown() {
  if (areas.value.length === 0) {
    return
  }

  isCraftsOpen.value = !isCraftsOpen.value
  if (isCraftsOpen.value) {
    isAreasOpen.value = false
  }
}

function toggleSelection(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

function toggleArea(area: string) {
  areas.value = toggleSelection(areas.value, area)
  areaSearch.value = ''
}

function toggleCraft(craft: string) {
  crafts.value = toggleSelection(crafts.value, craft)
  craftSearch.value = ''
}

function removeArea(area: string) {
  areas.value = areas.value.filter((item) => item !== area)
}

function removeCraft(craft: string) {
  crafts.value = crafts.value.filter((item) => item !== craft)
}

function openAreasDropdown() {
  isAreasOpen.value = true
  isCraftsOpen.value = false
}

function openCraftsDropdown() {
  if (areas.value.length === 0) {
    return
  }

  isCraftsOpen.value = true
  isAreasOpen.value = false
}
</script>

<template>
  <section class="rounded-2xl bg-white p-6 shadow-lg">
    <div class="mb-6 flex items-start">
      <div class="w-10"></div>

      <div class="flex-1 text-center">
        <h1 class="text-2xl font-bold text-slate-800">
          Trabalhe Conosco
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Preencha o formulario para enviar sua candidatura.
        </p>
      </div>

      <div class="flex w-10 justify-end">
        <DarkModeToggle />
      </div>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <input
        :value="name"
        @input="handleNameInput"
        type="text"
        placeholder="Nome completo *"
        maxlength="80"
        class="w-full cursor-text rounded-lg border p-2"
        required
      />
      <input
        :value="email"
        @input="handleEmailInput"
        type="email"
        placeholder="E-mail *"
        maxlength="120"
        class="w-full cursor-text rounded-lg border p-2"
        required
      />

      <div class="flex gap-2">
        <select
          v-model="selectedCountry"
          @change="handleCountryChange"
          class="w-20 cursor-pointer rounded-lg border p-2"
        >
          <option
            v-for="country in countries"
            :key="country.code"
            :value="country.code"
          >
            {{ country.label }}
          </option>
        </select>

        <input
          :value="phone"
          @input="handlePhoneInput"
          type="tel"
          inputmode="numeric"
          autocomplete="tel"
          placeholder="Telefone/WhatsApp *"
          class="flex-1 cursor-text rounded-lg border p-2"
          required
        />
      </div>

      <div ref="areasDropdownRef" class="relative">
        <div
          @click="openAreasDropdown"
          class="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border p-2 cursor-text"
        >
          <span
            v-for="item in areas"
            :key="item"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
          >
            {{ item }}
            <button
              type="button"
              @click.stop="removeArea(item)"
              class="cursor-pointer font-semibold text-slate-500 transition hover:text-slate-900"
              aria-label="Remover area"
            >
              x
            </button>
          </span>
          <input
            v-model="areaSearch"
            type="text"
            placeholder="Selecione uma ou mais áreas *"
            class="min-w-32 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
            @focus="openAreasDropdown"
            @click.stop
          />
          <button
            type="button"
            @click.stop="toggleAreasDropdown"
            class="ml-auto cursor-pointer text-xs text-slate-500"
          >
            {{ isAreasOpen ? 'Fechar' : 'Abrir' }}
          </button>
        </div>

        <div
          v-if="isAreasOpen"
          class="absolute z-20 mt-2 w-full rounded-lg border bg-white p-2 shadow-lg"
        >
          <button
            v-for="item in filteredAreas"
            :key="item"
            type="button"
            @click="toggleArea(item)"
            class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-50 cursor-pointer"
          >
            <span>{{ item }}</span>
            <span v-if="areas.includes(item)" class="text-slate-700">Selecionada</span>
          </button>
          <p
            v-if="filteredAreas.length === 0"
            class="text-sm text-slate-400"
          >
            Nenhuma área encontrada.
          </p>
        </div>
      </div>

      <div ref="craftsDropdownRef" class="relative">
        <div
          @click="openCraftsDropdown"
          :class="[
            'flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border p-2',
            areas.length === 0 ? 'cursor-not-allowed bg-slate-50' : 'cursor-text',
          ]"
        >
          <span
            v-for="item in crafts"
            :key="item"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
          >
            {{ item }}
            <button
              type="button"
              @click.stop="removeCraft(item)"
              class="font-semibold text-slate-500 transition hover:text-slate-900 cursor-pointer"
              aria-label="Remover funcao"
            >
              x
            </button>
          </span>
          <input
            v-model="craftSearch"
            type="text"
            :disabled="areas.length === 0"
            :placeholder="areas.length === 0 ? 'Selecione uma area antes de escolher funções *' : 'Selecione uma ou mais funções *'"
            class="min-w-32 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            @focus="openCraftsDropdown"
            @click.stop
          />
          <button
            type="button"
            @click.stop="toggleCraftsDropdown"
            :disabled="areas.length === 0"
            class="ml-auto cursor-pointer text-xs text-slate-500 disabled:cursor-not-allowed"
          >
            {{ isCraftsOpen ? 'Fechar' : 'Abrir' }}
          </button>
        </div>

        <div
          v-if="isCraftsOpen"
          class="absolute z-20 mt-2 w-full rounded-lg border bg-white p-2 shadow-lg"
        >
          <button
            v-for="item in filteredCrafts"
            :key="item"
            type="button"
            @click="toggleCraft(item)"
            class="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-50"
          >
            <span>{{ item }}</span>
            <span v-if="crafts.includes(item)" class="text-slate-700">Selecionada</span>
          </button>
          <p
            v-if="filteredCrafts.length === 0"
            class="text-sm text-slate-400"
          >
            Nenhuma funcao encontrada.
          </p>
        </div>
      </div>

      <input v-model="linkedin" type="url" placeholder="LinkedIn (opcional)" maxlength="200" class="w-full cursor-text rounded-lg border p-2" />
      <input v-model="portfolio" type="url" placeholder="Portfolio (opcional)" maxlength="200" class="w-full cursor-text rounded-lg border p-2" />
      <textarea v-model="message" placeholder="Deixe sua mensagem *" class="w-full cursor-text rounded-lg border p-2" required></textarea>

      <div class="space-y-2">
        <input
          ref="resumeInputRef"
          type="file"
          accept=".pdf,.doc,.docx"
          @change="handleFileChange"
          class="hidden"
        />

        <button
          type="button"
          @click="openResumePicker"
          class="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-all duration-500 ease-in-out hover:border-slate-300 hover:bg-slate-100"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 hover:bg-slate-700 text-lg text-white transition-transform duration-500 ease-in-out group-hover:scale-110">
              ↑
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">
                {{ resume ? 'Curriculo selecionado' : 'Enviar curriculo *' }}
              </p>
              <p class="text-xs text-slate-500">
                {{ resume ? resume.name : 'PDF, DOC ou DOCX' }}
              </p>
            </div>
          </div>

          <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            {{ resume ? 'Trocar arquivo' : 'Escolher arquivo' }}
          </span>
        </button>

        <div class="flex items-center justify-between gap-3">
          <p class="text-xs text-slate-500">
            Formatos aceitos: PDF, DOC e DOCX.
          </p>
          <button
            v-if="resume"
            type="button"
            @click="clearResume"
            class="cursor-pointer text-xs font-medium text-slate-600 transition hover:text-slate-900"
          >
            Remover arquivo
          </button>
        </div>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-slate-700 disabled:opacity-50"
      >
        {{ loading ? 'Enviando...' : 'Enviar candidatura' }}
      </button>

      <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </form>
  </section>
</template>
