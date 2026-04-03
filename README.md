# Easy Hire Form

Um formulário simples, moderno e reutilizável de **"Trabalhe Conosco"** para empresas integrarem facilmente em seus sites.

Este é um projeto **open source** e também faz parte do meu portfólio, pensado para demonstrar não só interface, mas também estrutura, reutilização, experiência do usuário e uma base pronta para integração com APIs reais.

---

## 💡 Sobre o projeto

O **Easy Hire Form** foi criado para resolver um problema comum:
formulários de candidatura longos, confusos e difíceis de preencher.

A proposta é oferecer uma solução:

* Simples
* Rápida de integrar
* Fácil de customizar
* Com boa experiência para o usuário

Além de ser útil para empresas, este projeto também foi desenvolvido como um case de portfólio para mostrar:

* Boas práticas de front-end
* Componentização com Vue
* Uso de TypeScript
* Estrutura escalável
* Pensamento orientado a produto
* Capacidade de transformar uma necessidade real em um produto reutilizável

---

## 🎯 Para que este projeto foi feito

O Easy Hire Form foi pensado para:

* empresas que precisam publicar uma página de candidatura sem começar do zero
* projetos que precisam de um formulário de recrutamento reutilizável
* estudos e demonstrações de arquitetura front-end com foco em produto
* servir como base para evoluções futuras, incluindo integração com APIs reais de RH

---

## 🛠️ Tecnologias utilizadas

* Vue 3
* TypeScript
* Tailwind CSS
* Vite

---

## 📦 Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/joaoluis17/easy-hire-form.git
```

### 2. Acesse a pasta do projeto

```bash
cd easy-hire-form
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o projeto

```bash
npm run dev
```

### 5. Acesse no navegador

```bash
http://localhost:5173
```

---

## ⚙️ Como utilizar no seu projeto

O formulário foi desenvolvido para ser facilmente adaptável.

Você pode:

* Alterar as áreas de atuação
* Configurar a API de envio dos dados
* Definir quais campos devem aparecer
* Personalizar estilos com Tailwind

As principais configurações ficam em:

```text
src/config/formDefinition.ts
src/config/formConfig.ts
```

---

## 🔌 API local para desenvolvimento

Ao rodar `npm run dev`, o projeto expõe uma API local em:

```bash
/api/apply
```

Essa API:

* Recebe o envio do formulário localmente
* Salva os dados da candidatura em `.easy-hire/submissions/`
* Salva o currículo junto com um arquivo `submission.json`

Isso facilita testes, demonstrações e o handoff do projeto para outras empresas.

### Como trocar pela API da empresa

Por padrão, o projeto usa:

```ts
import.meta.env.VITE_FORM_API_URL || '/api/apply'
```

Para produção, basta definir:

```bash
VITE_FORM_API_URL=https://api-da-empresa.com/apply
```

---

## 🧱 Estrutura do projeto

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

---

## 🎯 Possíveis usos

* Página "Trabalhe Conosco"
* Landing pages de recrutamento
* Sites institucionais
* Startups que precisam de uma solução rápida
* Projetos internos de RH

---

## 🤝 Contribuição

Como este é um projeto open source, qualquer pessoa pode estudar, adaptar, sugerir melhorias ou evoluir a ideia para o próprio contexto.

Se quiser contribuir, fique à vontade para abrir issue, sugerir melhorias ou adaptar o projeto para suas necessidades.

---

## 📩 Contato

Caso queira um formulário específico, uma versão personalizada para empresa, colaboração em projeto ou simplesmente trocar uma ideia sobre desenvolvimento e produto, pode falar comigo.

---

## Onde me encontrar

[![Website](https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://joao-luis-prado.netlify.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/joao-luis-prado)
[![X](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/JohnPrado1728)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/o_john_prado/)
[![Outlook](https://img.shields.io/badge/Outlook-0078D4?style=for-the-badge&logo=microsoft-outlook&logoColor=white)](mailto:jluispprado@hotmail.com)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/5511998962261)
