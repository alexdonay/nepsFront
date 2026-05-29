# 📋 Documentação da Estrutura do Projeto - NEPS Frontend

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitetura da Aplicação](#arquitetura-da-aplicação)
5. [Padrões e Convenções](#padrões-e-convenções)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Autenticação](#autenticação)
8. [Roteamento](#roteamento)
9. [Como Executar](#como-executar)

---

## 🎯 Visão Geral

**NEPS Frontend** é uma aplicação web desenvolvida em **React** com **Vite**, projetada para gerenciar salas de aula, horários, usuários, instituições, disciplinas e diversos recursos educacionais. A aplicação utiliza uma arquitetura modular com separação clara entre camadas de apresentação, lógica de negócio e comunicação com API.

**Versão**: 1.0.0  
**Ambiente**: React 19.2.6 + Vite 8.0.11  
**Tipo**: SPA (Single Page Application)

---

## 📁 Estrutura de Diretórios

```
nepsFront/
├── src/
│   ├── App.jsx                    # Componente raiz da aplicação
│   ├── App.css                    # Estilos globais
│   ├── main.jsx                   # Ponto de entrada
│   ├── components/                # Componentes reutilizáveis
│   │   ├── CNPJInput.jsx
│   │   ├── CpfInput.jsx
│   │   ├── Layout.jsx             # Layout principal
│   │   ├── PhoneInput.jsx
│   │   ├── Cnpj/
│   │   ├── Cpf/
│   │   ├── Email/
│   │   │   └── EmailInput.jsx
│   │   └── Phone/
│   ├── pages/                     # Páginas principais
│   │   ├── AccessDenied/          # Página de acesso negado
│   │   ├── Courses/               # Gestão de disciplinas
│   │   │   ├── CoursesList.jsx
│   │   │   └── CursesForm.tsx
│   │   ├── EnrollmentPeriods/     # Períodos de matrícula
│   │   │   ├── EnrollmentPeriods.jsx
│   │   │   ├── EnrollmentPeriodsForm.jsx
│   │   │   └── EnrollmentPeriodsList.jsx
│   │   ├── Home/                  # Dashboard início
│   │   │   └── Home.jsx
│   │   ├── Institution/           # Gestão de instituições
│   │   │   ├── InstitutionForm.jsx
│   │   │   └── InstitutionsList.jsx
│   │   ├── Login/                 # Autenticação
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ForgotPasswordSent.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── Regions/               # Gestão de regiões
│   │   │   ├── RegionsForm.jsx
│   │   │   └── RegionsList.jsx
│   │   ├── Rooms/                 # Gestão de salas
│   │   │   ├── RoomsList.jsx
│   │   │   └── RoomsForm.jsx
│   │   ├── Schedule/              # Agenda
│   │   │   └── Schedule.jsx
│   │   ├── ServiceRooms/          # Salas de serviço
│   │   │   ├── ServiceRoomForm.jsx
│   │   │   └── ServiceRoomsList.jsx
│   │   ├── Services/              # Gestão de serviços
│   │   │   ├── ServiceForm.jsx
│   │   │   └── ServicesList.jsx
│   │   ├── ServiceSchedules/      # Horários de serviço
│   │   │   ├── ServiceScheduleForm.jsx
│   │   │   └── ServiceSchedulesList.jsx
│   │   ├── Student/               # Gestão de alunos
│   │   │   ├── StudentForm.jsx
│   │   │   └── StudentsList.jsx
│   │   └── Users/                 # Gestão de usuários
│   │       ├── UserForm.jsx
│   │       └── UsersList.jsx
│   ├── services/                  # Serviços e integrações
│   │   ├── API_routes.js          # Definição de rotas da API
│   │   ├── api.js                 # Instância Axios configurada
│   │   ├── auth.js                # Lógica de autenticação
│   │   ├── repository.js          # Pattern repository (CRUD)
│   │   └── utils.js               # Funções utilitárias
│   ├── utils/
│   │   └── auth.js                # Utilitários de autenticação
│   └── constants/
│       └── permissions.js         # Constantes de permissões
├── public/                        # Arquivos estáticos
├── index.html                     # HTML de entrada
├── vite.config.js                 # Configuração Vite
├── eslint.config.mjs              # Configuração ESLint
├── vercel.json                    # Configuração Vercel
├── package.json                   # Dependências do projeto
└── README.md                      # Documentação geral
```

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnologia           | Versão | Propósito                   |
| -------------------- | ------ | --------------------------- |
| **React**            | 19.2.6 | Framework UI                |
| **React Router DOM** | 7.15.0 | Roteamento e navegação      |
| **Vite**             | 8.0.11 | Build tool e dev server     |
| **PrimeReact**       | 10.9.7 | Componentes UI ricos        |
| **PrimeFlex**        | 4.0.0  | Framework CSS flexbox       |
| **PrimeIcons**       | 7.0.0  | Biblioteca de ícones        |
| **Axios**            | 1.16.0 | Cliente HTTP                |
| **JWT Decode**       | 4.0.0  | Decodificação de tokens JWT |
| **Chart.js**         | 4.5.1  | Gráficos e visualizações    |

### Desenvolvimento

| Tecnologia               | Versão | Propósito              |
| ------------------------ | ------ | ---------------------- |
| **@vitejs/plugin-react** | 6.0.1  | Plugin React para Vite |
| **ESLint**               | -      | Linter JavaScript/JSX  |

---

## 🏗️ Arquitetura da Aplicação

### Camadas

```
┌─────────────────────────────────────────┐
│       UI Layer (Components/Pages)        │
│    - Componentes React                  │
│    - Páginas CRUD                       │
│    - Formulários                        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Logic Layer (Services)             │
│    - Repository Pattern                 │
│    - Autenticação                       │
│    - Validações                         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      API Layer (HTTP Client)            │
│    - Axios instance                     │
│    - Interceptadores                    │
│    - Roteamento de URLs                 │
└────────────────┬────────────────────────┘
                 │
          Backend API
          (Port 8000)
```

### Padrão de Arquitetura

**Repository Pattern**: Centraliza toda a comunicação com a API

```javascript
// Exemplo de uso
import { repository } from "../../services/repository";

// GET
const { data } = await repository.students.get();

// GET by ID
const { data } = await repository.students.getById(id);

// POST
await repository.students.post(studentData);

// PUT
await repository.students.put(id, studentData);

// DELETE
await repository.students.delete(id);
```

---

## 📐 Padrões e Convenções

### Nomenclatura de Arquivos

- **Componentes**: `PascalCase` (ex: `StudentForm.jsx`)
- **Páginas**: `PascalCase` (ex: `StudentsList.jsx`)
- **Serviços**: `camelCase` (ex: `api.js`, `auth.js`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `API_ROUTES`)

### Estrutura de Componentes

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";

export default function ComponenteName() {
  const [state, setState] = useState(initialValue);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await repository.resource.get();
      setState(data);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    }
  };

  return <div>{/* JSX */}</div>;
}
```

### API Routes Centralizadas

Todas as rotas de API estão centralizadas em `API_routes.js`:

```javascript
export const API_ROUTES = {
  AUTH: { ... },
  USERS: { ... },
  COURSES: { ... },
  CADASTROS: { ... },
  GESTAO: { ... },
  // etc
};
```

**Vantagens:**

- ✅ Fácil manutenção
- ✅ Sem URLs hardcoded
- ✅ Consistência nas rotas

---

## 🔄 Fluxo de Dados

### Fluxo de Requisição

```
1. Componente (StudentsList.jsx)
   ↓
2. Chamada ao Repository
   repository.students.get()
   ↓
3. API Service (api.js)
   Axios.get(url, headers)
   ↓
4. Interceptador de Request
   - Adiciona token Bearer automaticamente
   ↓
5. Backend API
   GET /api/v1/students
   ↓
6. Response com dados
   ↓
7. useState atualiza o estado
   setStudents(data)
   ↓
8. Re-render do componente
```

### Tratamento de Erros

```javascript
const loadData = async () => {
  try {
    const { data } = await repository.resource.get();
    setState(data);
  } catch (error) {
    console.error("Erro:", error.response?.data?.detail);
    setState([]);
  }
};
```

---

## 🔐 Autenticação

### Fluxo de Autenticação

```
1. Usuário acessa /login
   ↓
2. Submete credenciais (email, senha)
   ↓
3. API retorna token JWT
   ↓
4. Token armazenado em localStorage
   localStorage.setItem('token', token)
   ↓
5. Interceptador adiciona token em todas as requisições
   Authorization: Bearer {token}
   ↓
6. Usuário redirecionado para /home
```

### Armazenamento de Token

```javascript
// Salvando
localStorage.setItem("token", jwtToken);

// Recuperando
const token = localStorage.getItem("token");

// Removendo (logout)
localStorage.removeItem("token");
```

### Proteção de Rotas

Verificar se usuário está autenticado antes de acessar uma página.

---

## 🗺️ Roteamento

### Rotas Principais

| Caminho                        | Componente                 | Descrição             |
| ------------------------------ | -------------------------- | --------------------- |
| `/`                            | `Home.jsx`                 | Dashboard             |
| `/login`                       | `Login.jsx`                | Login                 |
| `/forgot-password`             | `ForgotPassword.jsx`       | Recuperar senha       |
| `/reset-password/:token`       | `ResetPassword.jsx`        | Resetar senha         |
| `/students`                    | `StudentsList.jsx`         | Lista de alunos       |
| `/students/new`                | `StudentForm.jsx`          | Novo aluno            |
| `/students/:id`                | `StudentForm.jsx`          | Editar aluno          |
| `/users`                       | `UsersList.jsx`            | Lista de usuários     |
| `/institutions`                | `InstitutionsList.jsx`     | Lista de instituições |
| `/courses`                     | `CoursesList.jsx`          | Lista de disciplinas       |
| `/rooms`                       | `RoomsList.jsx`            | Lista de salas        |
| `/rooms/new`                   | `RoomsForm.jsx`            | Nova sala             |
| `/rooms/:id`                   | `RoomsForm.jsx`            | Editar sala           |
| `/rooms/:roomId/schedules`     | `ServiceSchedulesList.jsx` | Agenda da sala        |
| `/rooms/:roomId/schedules/new` | `ServiceScheduleForm.jsx`  | Novo horário da sala  |
| `/services`                    | `ServicesList.jsx`         | Lista de serviços     |
| `/regions`                     | `RegionsList.jsx`          | Lista de regiões      |
| `/schedule`                    | `Schedule.jsx`             | Agenda                |
| `/access-denied`               | `AccessDenied.jsx`         | Acesso negado         |

---

## 🚀 Como Executar

### Instalação de Dependências

```bash
npm install
```

### Desenvolvimento

```bash
# Modo desenvolvimento (HTTP)
npm run dev

# Modo desenvolvimento (HTTPS)
npm run dev:https
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Gera arquivos otimizados em `dist/`

### Preview da Build

```bash
# HTTP
npm run preview

# HTTPS
npm run preview:https
```

---

## 📦 Principais Modules e Suas Responsabilidades

### `src/services/api.js`

- Configura instância Axios
- Define baseURL da API
- Adiciona interceptadores para autenticação
- Injeta token JWT em todas as requisições

### `src/services/API_routes.js`

- Centraliza todas as rotas de API
- Organiza rotas por módulo (AUTH, USERS, COURSES, etc)
- Suporta URLs dinâmicas com IDs

### `src/services/repository.js`

- **Repository Pattern**: Interface CRUD para cada recurso
- Encapsula chamadas de API
- Padroniza requisições GET, POST, PUT, DELETE
- Suporta casos especiais (filtros, relacionamentos)

### `src/services/auth.js`

- Lógica de autenticação
- Login, logout
- Validação de token

### `src/utils/auth.js`

- Utilitários de autenticação
- Decodificação de JWT
- Verificação de permissões

### `src/constants/permissions.js`

- Constantes de roles/permissões
- Mapeamento de funcionalidades por role

---

## 📊 Exemplo de Fluxo Completo: Listar Alunos

### 1. Componente faz requisição

```jsx
// src/pages/Student/StudentsList.jsx
useEffect(() => {
  loadStudents();
}, []);

const loadStudents = async () => {
  try {
    const { data } = await repository.students.get();
    setStudents(data.items || data);
  } catch (e) {
    setStudents([]);
  }
};
```

### 2. Repository executa requisição

```javascript
// src/services/repository.js
students: {
  get: () => api.get(API_ROUTES.GESTAO.STUDENTS),
  // ...
}
```

### 3. API Route define URL

```javascript
// src/services/API_routes.js
GESTAO: {
  STUDENTS: "/v1/gestao/students",
  // ...
}
```

### 4. Axios faz requisição

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptador adiciona token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 5. Request final

```
GET http://localhost:8000/api/v1/students
Authorization: Bearer eyJhbGc...
```

### 6. Response renderiza dados

```jsx
<DataTable value={students}>
  <Column field="name" header="Nome" />
  <Column field="cpf" header="CPF" />
  {/* ... */}
</DataTable>
```

---

## 🎨 Styling

- **PrimeFlex**: Framework CSS para layout flexbox
- **PrimeReact**: Componentes com temas integrados
- **CSS Custom**: `src/App.css` para estilos globais
- **Tailwind-like classes**: `w-full`, `flex`, `p-4`, etc

Exemplo:

```jsx
<div className="surface-card p-4 shadow-2 border-round">{/* Conteúdo */}</div>
```

---

## 📝 Boas Práticas

✅ **DO:**

- Use `API_ROUTES` para todas as URLs
- Use `repository` para chamadas de API
- Trate erros em try/catch
- Inicialize arrays vazios em erros
- Use tokens Bearer para autenticação

❌ **DON'T:**

- URLs hardcoded em componentes
- Requisições diretas com Axios sem tratamento
- Ignorar erros de requisição
- Armazenar dados sensíveis em localStorage desprotegidos

---

## 🔧 Troubleshooting

### Erro 404 em requisições

- Verifique se o backend está rodando em `localhost:8000`
- Confirme que as rotas em `API_routes.js` bate com o backend

### Token expirado

- Implemente refresh token para renovar automaticamente

### CORS ao subir para produção

- Configure CORS no backend corretamente
- Use proxy em produção se necessário

---

## 📞 Suporte e Contato

Para dúvidas sobre arquitetura ou padrões, consulte:

- Documentação oficial: [React Docs](https://react.dev)
- PrimeReact: [primereact.org](https://primereact.org)
- Vite: [vitejs.dev](https://vitejs.dev)

---

**Última atualização**: 25 de maio de 2026
