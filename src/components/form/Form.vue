<script setup lang="ts">
import DarkModeToggle from '../DarkModeToggle.vue'
import { ref } from 'vue'
import { formConfig } from '../../config/formConfig'

const name = ref('')
const email = ref('')
const phone = ref('')
const area = ref('')
const linkedin = ref('')
const portfolio = ref('')
const message = ref('')
const resume = ref<File | null>(null)
const selectedCountry = ref('BR')

const countries = [
  { code: 'BR', label: 'Brasil (+55)', dialCode: '+55' },
  { code: 'US', label: 'Estados Unidos (+1)', dialCode: '+1' },
  { code: 'PT', label: 'Portugal (+351)', dialCode: '+351' },
  { code: 'AR', label: 'Argentina (+54)', dialCode: '+54' },
]

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  resume.value = target.files?.[0] ?? null
}

async function handleSubmit() {
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
    formData.append('area', area.value)
    formData.append('craft', craft.value)
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
      throw new Error('Falha ao enviar formulário.')
    }

    successMessage.value = 'Candidatura enviada com sucesso!'
  } catch (error) {
    errorMessage.value = 'Não foi possível enviar sua candidatura.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

// logica para os inputs
function handleNameInput(event: Event) {
  const target = event.target as HTMLInputElement

  let value = target.value

  // remove tudo que NÃO for letra (com acento) ou espaço
  value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '')

  // limita a 80 caracteres
  value = value.slice(0, 80)

  name.value = value
}

function handleEmailInput(event: Event) {
  const target = event.target as HTMLInputElement

  let value = target.value

  // remove espaços
  value = value.replace(/\s/g, '')

  // deixa tudo minúsculo
  value = value.toLowerCase()

  // limita a 120 caracteres
  value = value.slice(0, 120)

  email.value = value
}

function isValidEmail(value: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
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

  // pega apenas números
  let digits = target.value.replace(/\D/g, '')

  // define limite por país
  let maxLength = 15 // fallback

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

  // aplica limite
  digits = digits.slice(0, maxLength)

  // formata com base no país
  phone.value = formatPhoneByCountry(digits, selectedCountry.value)
}

function handleCountryChange() {
  phone.value = ''
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, '')
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
          Preencha o formulário para enviar sua candidatura.
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
        placeholder="Nome completo"
        maxlength="80"
        class="w-full rounded-lg border p-2"
        required
      />
      <input
        :value="email"
        @input="handleEmailInput"
        type="email"
        placeholder="E-mail"
        maxlength="120"
        class="w-full rounded-lg border p-2"
        required
      />

      <div class="flex gap-2">
        <select
          v-model="selectedCountry"
          @change="handleCountryChange"
          class="w-20 rounded-lg border p-2 cursor-pointer"
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
          type="number"
          placeholder="Telefone/WhatsApp"
          class="flex-1 rounded-lg border p-2"
          required
        />
      </div>

      <select v-model="area" class="w-full rounded-lg border p-2 cursor-pointer">
        <option disabled value="">Selecione uma área</option>
        <option v-for="item in formConfig.areas" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
      
      <select v-model="craft" class="w-full rounded-lg border p-2 cursor-pointer">
        <option disabled value="">Selecione uma função</option>
        <option v-for="item in formConfig.crafts" :key="item" :value="item">
          {{ item }}
        </option>
      </select>

      <input v-model="linkedin" type="url" placeholder="LinkedIn" class="w-full rounded-lg border p-2" />
      <input v-model="portfolio" type="url" placeholder="Portfólio" class="w-full rounded-lg border p-2" />
      <textarea v-model="message" placeholder="Mensagem" class="w-full rounded-lg border p-2"></textarea>

      <input type="file" accept=".pdf,.doc,.docx" @change="handleFileChange" />

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-slate-900 px-4 py-2 text-white
              disabled:opacity-50 cursor-pointer
              transition-all duration-300 ease-in-out
              hover:bg-slate-700 hover:scale-105"
      >
        {{ loading ? 'Enviando...' : 'Enviar candidatura' }}
      </button>

      <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </form>
  </section>
</template>