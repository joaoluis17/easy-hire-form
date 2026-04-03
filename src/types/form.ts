export type CountryCode = 'BR' | 'US' | 'PT' | 'AR'

export interface UploadedResume {
  name: string
  size: number
  type: string
}

export interface JobApplicationData {
  name: string
  email: string
  phoneCountry: CountryCode
  phone: string
  phoneDigits: string
  areas: string[]
  crafts: string[]
  linkedin: string
  portfolio: string
  message: string
  resume: File | null
}

export interface FormFieldConfig {
  linkedin: boolean
  portfolio: boolean
  coverLetter: boolean
}

export interface FormConfigDefinition {
  companyName: string
  areas: string[]
  craftsByArea: Record<string, string[]>
  fields: FormFieldConfig
}

export interface FormConfig extends FormConfigDefinition {
  apiUrl: string
}
