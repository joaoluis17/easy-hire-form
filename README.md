# Easy Hire Form

Formulário reutilizável de "Trabalhe Conosco" com Vue 3, TypeScript, Tailwind e API local para desenvolvimento.

## Visão geral

O projeto foi estruturado para atender dois cenários:

- desenvolvimento local com uma API funcional embutida no ambiente Vite
- customização por empresas que depois vão apontar o formulário para a própria API em produção

## Tecnologias

- Vue 3
- TypeScript
- Tailwind CSS
- Vite

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Execute o projeto:

```bash
npm run dev
```

3. Acesse:

```bash
http://localhost:5173
```

## API local de desenvolvimento

Quando o projeto roda com `npm run dev`, a API local fica disponível em:

```bash
/api/apply
```

Os envios são salvos em:

```bash
.easy-hire/submissions/
```

Cada candidatura gera:

- um `submission.json` com os dados recebidos
- o arquivo do currículo, quando enviado

## Como trocar a API em produção

Por padrão, o frontend usa:

```ts
import.meta.env.VITE_FORM_API_URL || '/api/apply'
```

Para usar a API real da empresa, defina a variável:

```bash
VITE_FORM_API_URL=https://api-da-empresa.com/apply
```

## Estrutura principal

```text
src/
  components/
    form/
      Form.vue
      MultiSelectField.vue
      ResumeUploadField.vue
  composables/
    usePhoneField.ts
  config/
    formDefinition.ts
    formConfig.ts
  shared/
    formValidation.ts
  types/
    form.ts

server/
  localFormApi.ts
```

## O que já está organizado

- validação compartilhada entre frontend e API local
- multiselect pesquisável para áreas e funções
- upload de currículo com componente próprio
- máscara de telefone isolada em composable
- configuração centralizada para campos, áreas e funções

## Próximos passos sugeridos

- adicionar testes automatizados
- criar um painel local para listar candidaturas salvas
- permitir integração com serviços externos de RH
