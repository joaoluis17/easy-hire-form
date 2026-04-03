import type { FormFieldConfig, UploadedResume } from '../types/form'

export const OTHER_OPTION = 'Outra'

export const FORM_LIMITS = {
  name: 80,
  email: 120,
  url: 200,
  message: 1000,
  resumeSizeInBytes: 5 * 1024 * 1024,
} as const

export type SubmissionFieldErrorKey =
  | 'name'
  | 'email'
  | 'phone'
  | 'areas'
  | 'crafts'
  | 'linkedin'
  | 'portfolio'
  | 'message'
  | 'resume'
  | 'form'

export type SubmissionFieldErrors = Partial<Record<SubmissionFieldErrorKey, string>>

export interface SubmissionValidationInput {
  name: string
  email: string
  phone: string
  phoneDigits: string
  areas: string[]
  crafts: string[]
  linkedin: string
  portfolio: string
  message: string
  resume: UploadedResume | null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']

export function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function isValidUrl(value: string) {
  try {
    const parsedUrl = new URL(value)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

function hasAllowedResumeExtension(fileName: string) {
  const normalizedFileName = fileName.toLowerCase()
  return ALLOWED_RESUME_EXTENSIONS.some((extension) => normalizedFileName.endsWith(extension))
}

function sanitizeArray(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
}

export function validateSubmission(
  input: SubmissionValidationInput,
  fields: FormFieldConfig,
) {
  const errors: SubmissionFieldErrors = {}

  if (!input.name.trim()) {
    errors.name = 'Preencha seu nome completo.'
  }

  if (!input.email.trim()) {
    errors.email = 'Preencha seu e-mail.'
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.email = 'Digite um e-mail válido.'
  }

  if (!input.phoneDigits.trim()) {
    errors.phone = 'Preencha seu telefone.'
  }

  if (sanitizeArray(input.areas).length === 0) {
    errors.areas = 'Selecione pelo menos uma área.'
  }

  if (sanitizeArray(input.crafts).length === 0) {
    errors.crafts = 'Selecione pelo menos uma função.'
  }

  if (fields.linkedin && input.linkedin.trim() && !isValidUrl(input.linkedin.trim())) {
    errors.linkedin = 'Informe uma URL válida para o LinkedIn.'
  }

  if (fields.portfolio && input.portfolio.trim() && !isValidUrl(input.portfolio.trim())) {
    errors.portfolio = 'Informe uma URL válida para o portfólio.'
  }

  if (fields.coverLetter && !input.message.trim()) {
    errors.message = 'Preencha sua mensagem.'
  }

  if (fields.coverLetter && input.message.length > FORM_LIMITS.message) {
    errors.message = `A mensagem deve ter no máximo ${FORM_LIMITS.message} caracteres.`
  }

  if (!input.resume) {
    errors.resume = 'Envie seu currículo.'
  } else {
    if (!hasAllowedResumeExtension(input.resume.name)) {
      errors.resume = 'Envie um arquivo PDF, DOC ou DOCX.'
    } else if (input.resume.size > FORM_LIMITS.resumeSizeInBytes) {
      errors.resume = 'O currículo deve ter no máximo 5 MB.'
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
