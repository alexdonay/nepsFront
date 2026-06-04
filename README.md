This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Filtros e drawer de pesquisa

Este projeto utiliza um componente compartilhado de filtros em drawer nas telas de listagem.

- Componente principal: `src/components/FilterDrawer.jsx` — drawer reutilizável que renderiza campos a partir de uma configuração (`filters`).
- Componente específico de disciplinas: `src/pages/Disciplines/DisciplinesFilter.jsx` — encapsula as opções e configurações de filtro para a listagem de disciplinas.
- Roles de usuário suportados pelo backend: `admin`, `education_institute` e `service`.
- Convenções de query params:
  - Campos textuais usam sufixo `_like` por padrão (ex.: `name_like=joao`).
  - Campos multiselect usam sufixo `_in` e são serializados como CSV nas chamadas de listagem (ex.: `role_in=ADMIN,USER`).
  - Date range produz dois params: `{key}_start` e `{key}_end` (formato `YYYY-MM-DD`).
  - Caso seja necessário outro nome de parâmetro, o filtro pode definir `queryKey` na configuração.

As páginas de listagem usam `useSearchParams` para persistir filtros na URL e `src/internships/repository.js` aceita `params` para repassar query strings para a API.

## Migração de vínculo em horário

As rotas de vínculo e desvínculo de aluno em horário não recebem mais dados na URL.

O frontend deve enviar `room_id`, `day_of_week`, `period`, `period_id` e `student_id` no body.

Rotas novas:

- `POST /api/v1/rooms/schedule/student`
- `DELETE /api/v1/rooms/schedule/student`

## Variáveis de ambiente

Este projeto usa o arquivo `.env.local` na raiz do repositório para configurar integrações locais.

### Cloudinary

O cadastro de alunos envia um PDF obrigatório para o Cloudinary antes de salvar o registro no backend. Para isso, configure as variáveis abaixo no `.env.local`:

```dotenv
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_API_KEY=sua_api_key
VITE_CLOUDINARY_API_SECRET=seu_api_secret
```

Observações:

- O arquivo `.env.local` não deve ser commitado no repositório.
- Sempre reinicie o servidor de desenvolvimento após alterar qualquer variável de ambiente.
- O PDF enviado deve ter no máximo 5MB.
- O frontend valida o arquivo antes do upload e envia ao backend apenas a URL retornada pelo Cloudinary.
