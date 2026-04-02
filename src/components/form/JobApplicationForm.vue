<script setup lang="ts">
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
    formData.append('phone', phone.value)
    formData.append('area', area.value)
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
</script>

<template>
  <section class="rounded-2xl bg-white p-6 shadow-lg">
    <h1 class="mb-2 text-2xl font-bold text-slate-800">Trabalhe Conosco</h1>
    <p class="mb-6 text-sm text-slate-500">
      Preencha o formulário para enviar sua candidatura.
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <input v-model="name" type="text" placeholder="Nome completo" class="w-full rounded-lg border p-3" />
      <input v-model="email" type="email" placeholder="E-mail" class="w-full rounded-lg border p-3" />
      <input v-model="phone" type="text" placeholder="Telefone" class="w-full rounded-lg border p-3" />

      <select v-model="area" class="w-full rounded-lg border p-3">
        <option disabled value="">Selecione uma área</option>
        <option v-for="item in formConfig.areas" :key="item" :value="item">
          {{ item }}
        </option>
      </select>

      <input v-model="linkedin" type="url" placeholder="LinkedIn" class="w-full rounded-lg border p-3" />
      <input v-model="portfolio" type="url" placeholder="Portfólio" class="w-full rounded-lg border p-3" />
      <textarea v-model="message" placeholder="Mensagem" class="w-full rounded-lg border p-3"></textarea>

      <input type="file" accept=".pdf,.doc,.docx" @change="handleFileChange" />

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-slate-900 px-4 py-3 text-white disabled:opacity-50"
      >
        {{ loading ? 'Enviando...' : 'Enviar candidatura' }}
      </button>

      <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </form>
  </section>
</template>