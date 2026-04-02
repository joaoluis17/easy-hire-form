import type { FormConfig } from '../types/form'

export const formConfig: FormConfig = {
  companyName: 'Easy Hire',
  apiUrl: 'https://sua-api-aqui.com/apply',
  areas: [
    'Front-end',
    'Back-end',
    'Full Stack',
    'Design',
    'Produto',
    'Marketing'
  ],
  fields: {
    linkedin: true,
    portfolio: true,
    coverLetter: true
  }
}