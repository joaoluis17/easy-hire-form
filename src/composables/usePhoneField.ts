import { ref } from 'vue'
import type { CountryCode } from '../types/form'

interface PhoneCountry {
  code: CountryCode
  label: string
  dialCode: string
}

const phoneCountries: PhoneCountry[] = [
  { code: 'BR', label: 'Brasil (+55)', dialCode: '+55' },
  { code: 'US', label: 'Estados Unidos (+1)', dialCode: '+1' },
  { code: 'PT', label: 'Portugal (+351)', dialCode: '+351' },
  { code: 'AR', label: 'Argentina (+54)', dialCode: '+54' },
]

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

function formatPhoneByCountry(value: string, countryCode: CountryCode) {
  switch (countryCode) {
    case 'BR':
      return formatBrazilPhone(value)
    case 'US':
      return formatUSPhone(value)
    case 'PT':
      return formatPortugalPhone(value)
    case 'AR':
      return formatArgentinaPhone(value)
  }
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, '')
}

function getMaxPhoneLength(countryCode: CountryCode) {
  switch (countryCode) {
    case 'BR':
      return 11
    case 'US':
      return 10
    case 'PT':
      return 9
    case 'AR':
      return 10
  }
}

export function usePhoneField() {
  const selectedCountry = ref<CountryCode>('BR')
  const phone = ref('')

  function handlePhoneInput(event: Event) {
    const target = event.target as HTMLInputElement
    const digits = getPhoneDigits(target.value).slice(0, getMaxPhoneLength(selectedCountry.value))

    phone.value = formatPhoneByCountry(digits, selectedCountry.value)
  }

  function handleCountryChange() {
    phone.value = ''
  }

  return {
    countries: phoneCountries,
    phone,
    selectedCountry,
    handleCountryChange,
    handlePhoneInput,
    getPhoneDigits,
  }
}
