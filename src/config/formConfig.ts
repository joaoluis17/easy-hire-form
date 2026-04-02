import type { FormConfig } from '../types/form'

// config/formConfig.ts
export const formConfig: FormConfig = {
  companyName: 'Easy Hire',
  apiUrl: 'https://sua-api-aqui.com/apply',
  areas: [
    'Tecnologia',
    'Design',
    'Produto',
    'Marketing',
    'Vendas',
    'Recursos Humanos',
    'Financeiro',
  ],
  craftsByArea: {
    Tecnologia: ['Front-end', 'Back-end', 'Full Stack', 'DevOps', 'QA', 'Mobile'],
    Design: ['UI Designer', 'UX Designer', 'Motion', 'Brand Designer'],
    Produto: ['Product Manager', 'Product Owner', 'Product Analyst'],
    Marketing: ['Growth', 'SEO', 'Social Media', 'Copywriter', 'CRM'],
    Vendas: ['SDR', 'Account Executive', 'Customer Success'],
    'Recursos Humanos': ['Recrutamento', 'T&D', 'HRBP', 'Benefícios'],
    Financeiro: ['Contabilidade', 'Controladoria', 'FP&A', 'Tesouraria'],
  },
  fields: {
    linkedin: true,
    portfolio: true,
    coverLetter: true,
  },
}