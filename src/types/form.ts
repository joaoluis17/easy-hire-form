export interface JobApplicationData {
  name: string
  email: string
  phone: string
  areas: string[]
  crafts: string[]
  linkedin?: string
  portfolio?: string
  message?: string
  resume: File | null
}

// types/form.ts — adicione o novo tipo
export interface FormConfig {
  companyName: string
  apiUrl: string
  areas: string[]
  craftsByArea: Record<string, string[]>
  fields: {
    linkedin: boolean
    portfolio: boolean
    coverLetter: boolean
  }
}
