export interface JobApplicationData {
  name: string
  email: string
  phone: string
  area: string
  linkedin?: string
  portfolio?: string
  message?: string
  resume: File | null
}

export interface FormConfig {
  companyName: string
  apiUrl: string
  areas: string[]
  fields: {
    linkedin: boolean
    portfolio: boolean
    coverLetter: boolean
  }
}