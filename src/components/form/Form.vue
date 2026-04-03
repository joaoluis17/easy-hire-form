<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DarkModeToggle from '../DarkModeToggle.vue'
import MultiSelectField from './MultiSelectField.vue'
import ResumeUploadField from './ResumeUploadField.vue'
import { formConfig } from '../../config/formConfig'
import { usePhoneField } from '../../composables/usePhoneField'
import {
  FORM_LIMITS,
  OTHER_OPTION,
  type SubmissionFieldErrorKey,
  type SubmissionFieldErrors,
  validateSubmission,
} from '../../shared/formValidation'
import type { JobApplicationData, UploadedResume } from '../../types/form'

const name = ref('')
const email = ref('')
const areas = ref<string[]>([])
const crafts = ref<string[]>([])
const linkedin = ref('')
const portfolio = ref('')
const message = ref('')
const resume = ref<File | null>(null)

const { countries, phone, selectedCountry, handleCountryChange, handlePhoneInput, getPhoneDigits } = usePhoneField()

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const fieldErrors = ref<SubmissionFieldErrors>({})

const availableCrafts = computed(() => {
  const uniqueCrafts = new Set<string>([OTHER_OPTION])

  for (const selectedArea of areas.value) {
    for (const craft of formConfig.craftsByArea[selectedArea] ?? []) {
      uniqueCrafts.add(craft)
    }
  }

  return Array.from(uniqueCrafts)
})

const areaOptions = computed(() => [...formConfig.areas, OTHER_OPTION])

watch(availableCrafts, (nextCrafts) => {
  crafts.value = crafts.value.filter((selectedCraft) => nextCrafts.includes(selectedCraft))
})

function clearFieldError(field: SubmissionFieldErrorKey) {
  if (!fieldErrors.value[field]) {
    return
  }

  const nextErrors = { ...fieldErrors.value }
  delete nextErrors[field]
  fieldErrors.value = nextErrors
}

function resetFeedbackMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function handleNameInput(event: Event) {
  const target = event.target as HTMLInputElement
  const sanitizedValue = target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '').slice(0, FORM_LIMITS.name)

  name.value = sanitizedValue
  clearFieldError('name')
  resetFeedbackMessages()
}

function handleEmailInput(event: Event) {
  const target = event.target as HTMLInputElement
  const sanitizedValue = target.value.replace(/\s/g, '').toLowerCase().slice(0, FORM_LIMITS.email)

  email.value = sanitizedValue
  clearFieldError('email')
  resetFeedbackMessages()
}

function handleLinkedinInput(event: Event) {
  const target = event.target as HTMLInputElement

  linkedin.value = target.value.slice(0, FORM_LIMITS.url)
  clearFieldError('linkedin')
  resetFeedbackMessages()
}

function handlePortfolioInput(event: Event) {
  const target = event.target as HTMLInputElement

  portfolio.value = target.value.slice(0, FORM_LIMITS.url)
  clearFieldError('portfolio')
  resetFeedbackMessages()
}

function handleMessageInput(event: Event) {
  const target = event.target as HTMLTextAreaElement

  message.value = target.value.slice(0, FORM_LIMITS.message)
  clearFieldError('message')
  resetFeedbackMessages()
}

function handleAreasUpdate(value: string[]) {
  areas.value = value
  clearFieldError('areas')
  resetFeedbackMessages()
}

function handleCraftsUpdate(value: string[]) {
  crafts.value = value
  clearFieldError('crafts')
  resetFeedbackMessages()
}

function handleResumeUpdate(value: File | null) {
  resume.value = value
  clearFieldError('resume')
  resetFeedbackMessages()
}

function buildValidationPayload() {
  const uploadedResume: UploadedResume | null = resume.value
    ? {
        name: resume.value.name,
        size: resume.value.size,
        type: resume.value.type,
      }
    : null

  return {
    name: name.value,
    email: email.value,
    phone: phone.value,
    phoneDigits: getPhoneDigits(phone.value),
    areas: areas.value,
    crafts: crafts.value,
    linkedin: linkedin.value,
    portfolio: portfolio.value,
    message: formConfig.fields.coverLetter ? message.value : '',
    resume: uploadedResume,
  }
}

function buildFormData(application: JobApplicationData) {
  const formData = new FormData()

  formData.append('name', application.name)
  formData.append('email', application.email)
  formData.append('phoneCountry', application.phoneCountry)
  formData.append('phone', application.phone)
  formData.append('phoneDigits', application.phoneDigits)
  formData.append('areas', JSON.stringify(application.areas))
  formData.append('crafts', JSON.stringify(application.crafts))
  formData.append('linkedin', application.linkedin)
  formData.append('portfolio', application.portfolio)
  formData.append('message', application.message)

  if (application.resume) {
    formData.append('resume', application.resume)
  }

  return formData
}

function resetForm() {
  name.value = ''
  email.value = ''
  phone.value = ''
  selectedCountry.value = 'BR'
  areas.value = []
  crafts.value = []
  linkedin.value = ''
  portfolio.value = ''
  message.value = ''
  resume.value = null
  fieldErrors.value = {}
}

async function handleSubmit() {
  resetFeedbackMessages()

  const validationResult = validateSubmission(buildValidationPayload(), formConfig.fields)

  if (!validationResult.isValid) {
    fieldErrors.value = validationResult.errors
    errorMessage.value = 'Revise os campos obrigatórios antes de enviar.'
    return
  }

  const applicationData: JobApplicationData = {
    name: name.value.trim(),
    email: email.value.trim(),
    phoneCountry: selectedCountry.value,
    phone: phone.value,
    phoneDigits: getPhoneDigits(phone.value),
    areas: areas.value,
    crafts: crafts.value,
    linkedin: formConfig.fields.linkedin ? linkedin.value.trim() : '',
    portfolio: formConfig.fields.portfolio ? portfolio.value.trim() : '',
    message: formConfig.fields.coverLetter ? message.value.trim() : '',
    resume: resume.value,
  }

  try {
    loading.value = true
    fieldErrors.value = {}

    const response = await fetch(formConfig.apiUrl, {
      method: 'POST',
      body: buildFormData(applicationData),
    })

    const responseBody = await response.json().catch(() => null) as
      | { message?: string; errors?: SubmissionFieldErrors }
      | null

    if (!response.ok) {
      if (responseBody?.errors) {
        fieldErrors.value = responseBody.errors
      }

      throw new Error(responseBody?.message || 'Não foi possível enviar sua candidatura.')
    }

    successMessage.value = responseBody?.message || 'Candidatura enviada com sucesso!'
    resetForm()
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Não foi possível enviar sua candidatura.'
  } finally {
    loading.value = false
  }
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
      <div>
        <input
          :value="name"
          @input="handleNameInput"
          type="text"
          placeholder="Nome completo *"
          maxlength="80"
          :aria-invalid="Boolean(fieldErrors.name)"
          class="w-full cursor-text rounded-lg border p-2"
          required
        />
        <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name }}</p>
      </div>

      <div>
        <input
          :value="email"
          @input="handleEmailInput"
          type="email"
          placeholder="E-mail *"
          maxlength="120"
          :aria-invalid="Boolean(fieldErrors.email)"
          class="w-full cursor-text rounded-lg border p-2"
          required
        />
        <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
      </div>

      <div>
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
            @focus="clearFieldError('phone')"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="Telefone/WhatsApp *"
            :aria-invalid="Boolean(fieldErrors.phone)"
            class="flex-1 cursor-text rounded-lg border p-2"
            required
          />
        </div>
        <p v-if="fieldErrors.phone" class="mt-1 text-sm text-red-600">{{ fieldErrors.phone }}</p>
      </div>

      <MultiSelectField
        id="areas"
        :model-value="areas"
        :options="areaOptions"
        placeholder="Selecione uma ou mais áreas *"
        empty-message="Nenhuma área encontrada."
        :error="fieldErrors.areas"
        @update:model-value="handleAreasUpdate"
      />

      <MultiSelectField
        id="crafts"
        :model-value="crafts"
        :options="availableCrafts"
        :disabled="areas.length === 0"
        :placeholder="areas.length === 0 ? 'Selecione uma área antes de escolher funções *' : 'Selecione uma ou mais funções *'"
        empty-message="Nenhuma função encontrada."
        :error="fieldErrors.crafts"
        @update:model-value="handleCraftsUpdate"
      />

      <div v-if="formConfig.fields.linkedin">
        <input
          :value="linkedin"
          @input="handleLinkedinInput"
          type="url"
          placeholder="LinkedIn (opcional)"
          maxlength="200"
          :aria-invalid="Boolean(fieldErrors.linkedin)"
          class="w-full cursor-text rounded-lg border p-2"
        />
        <p v-if="fieldErrors.linkedin" class="mt-1 text-sm text-red-600">{{ fieldErrors.linkedin }}</p>
      </div>

      <div v-if="formConfig.fields.portfolio">
        <input
          :value="portfolio"
          @input="handlePortfolioInput"
          type="url"
          placeholder="Portfólio (opcional)"
          maxlength="200"
          :aria-invalid="Boolean(fieldErrors.portfolio)"
          class="w-full cursor-text rounded-lg border p-2"
        />
        <p v-if="fieldErrors.portfolio" class="mt-1 text-sm text-red-600">{{ fieldErrors.portfolio }}</p>
      </div>

      <div v-if="formConfig.fields.coverLetter">
        <textarea
          :value="message"
          @input="handleMessageInput"
          placeholder="Deixe sua mensagem *"
          :maxlength="FORM_LIMITS.message"
          :aria-invalid="Boolean(fieldErrors.message)"
          class="w-full cursor-text rounded-lg border p-2"
          required
        ></textarea>
        <div class="mt-1 flex items-center justify-between gap-3">
          <p v-if="fieldErrors.message" class="text-sm text-red-600">{{ fieldErrors.message }}</p>
          <span class="ml-auto text-xs text-slate-500">
            {{ message.length }}/{{ FORM_LIMITS.message }}
          </span>
        </div>
      </div>

      <ResumeUploadField
        :model-value="resume"
        :error="fieldErrors.resume"
        @update:model-value="handleResumeUpdate"
      />

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
