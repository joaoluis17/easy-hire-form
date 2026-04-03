import type { FormConfig } from '../types/form'
import { formDefinition } from './formDefinition'

export const formConfig: FormConfig = {
  ...formDefinition,
  apiUrl: import.meta.env.VITE_FORM_API_URL || '/api/apply',
}
