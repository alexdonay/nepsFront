# Padrão de Filtros em Telas de Listagem — Documentação UX

## 1. Visão Geral

Todas as telas de listagem do sistema devem implementar um **drawer lateral direito** contendo filtros. O drawer segue o padrão de interação "slide-in" e é acionado por um botão "Filtros" ao lado do título da página.

## 2. Comportamento Geral

- O drawer abre da direita para a esquerda sobrepondo o conteúdo da listagem
- Possui um fundo semi-transparente (overlay) que ao clicar fecha o drawer
- Enquanto o drawer estiver aberto, o scroll da página principal é bloqueado
- Ao aplicar filtros, a tabela é recarregada e o drawer fecha automaticamente
- O botão "Filtros" exibe um badge com a contagem de filtros ativos
- A query é refletida na URL como query parameters para permitir compartilhamento/bookmark

## 3. Layout do Drawer

```
+-------------------------------+
| Filtros                    [X]|
+-------------------------------+
|                               |
| [Grupo de Filtros]            |
| +---------------------------+ |
| | label                   ▼ | |
| +---------------------------+ |
|                               |
| [Grupo de Filtros]            |
| +---------------------------+ |
| | label              ▼      | |
| +---------------------------+ |
| +---------------------------+ |
| | label              ▼      | |
| +---------------------------+ |
|                               |
| +---------------------------+ |
| | label    [     ] [     ]  | |
| +---------------------------+ |
|                               |
| +---------------------------+ |
| | [ ] Checkbox              | |
| | [ ] Checkbox              | |
| +---------------------------+ |
|                               |
| +---------------------------+ |
| | label        [   ] [   ]  | |
| +---------------------------+ |
|                               |
| +---------------------------+ |
| | label                [  ]| |
| +---------------------------+ |
|                               |
| [Aplicar]  [Limpar]          |
+-------------------------------+
```

## 4. Componentes de Filtro

| Componente PrimeReact | Uso                                          | Casos                                 |
| --------------------- | -------------------------------------------- | ------------------------------------- |
| `InputText`           | Filtro textual (busca por nome, email, etc.) | nome, email, código                   |
| `Dropdown`            | Seleção única de valor pré-definido          | status, perfil, região, disciplina         |
| `MultiSelect`         | Seleção múltipla                             | múltiplos status, múltiplas regiões   |
| `Calendar`            | Data única ou intervalo de datas             | período de inscrição, data de criação |
| `Checkbox`            | Booleano                                     | possui maca, prioritário              |
| `InputNumber`         | Número exato ou intervalo                    | capacidade da sala, semestre          |

## 5. Tipos de Filtro por Funcionalidade

### 5.1 Alunos (`/students`)

| Campo       | Tipo                   | Opções                           |
| ----------- | ---------------------- | -------------------------------- |
| Nome        | `InputText` (contains) | livre                            |
| CPF         | `InputText` (exact)    | livre                            |
| Email       | `InputText` (contains) | livre                            |
| Disciplina       | `Dropdown` (single)    | carregado da API de disciplinas       |
| Instituição | `Dropdown` (single)    | carregado da API de instituições |
| Semestre    | `InputNumber` (exact)  | livre                            |

### 5.2 Usuários (`/users`)

| Campo  | Tipo                   | Opções                                    |
| ------ | ---------------------- | ----------------------------------------- |
| Nome   | `InputText` (contains) | livre                                     |
| Email  | `InputText` (contains) | livre                                     |
| Perfil | `Dropdown` (single)    | `admin`, `education_institute`, `service` |
| Status | `Dropdown` (single)    | Ativo, Inativo                            |

### 5.3 Instituições (`/institutions`)

| Campo      | Tipo                   | Opções                       |
| ---------- | ---------------------- | ---------------------------- |
| Nome       | `InputText` (contains) | livre                        |
| CNPJ       | `InputText` (exact)    | livre                        |
| Status     | `Dropdown` (single)    | Ativo, Inativo               |
| Prioridade | `Dropdown` (single)    | Prioritário, Não prioritário |

### 5.4 Disciplinas (`/courses`)

| Campo  | Tipo                   | Opções                      |
| ------ | ---------------------- | --------------------------- |
| Nome   | `InputText` (contains) | livre                       |
| Código | `InputText` (contains) | livre                       |
| Região | `Dropdown` (single)    | carregado da API de regiões |

### 5.5 Salas (`/rooms`)

| Campo       | Tipo                   | Opções                       |
| ----------- | ---------------------- | ---------------------------- |
| Nome        | `InputText` (contains) | livre                        |
| Serviço     | `Dropdown` (single)    | carregado da API de serviços |
| Possui Maca | `Dropdown` (single)    | Sim, Não                     |

### 5.6 Regiões (`/regions`)

| Campo  | Tipo                   | Opções         |
| ------ | ---------------------- | -------------- |
| Nome   | `InputText` (contains) | livre          |
| Status | `Dropdown` (single)    | Ativo, Inativo |

### 5.7 Serviços (`/services`)

| Campo  | Tipo                   | Opções                      |
| ------ | ---------------------- | --------------------------- |
| Nome   | `InputText` (contains) | livre                       |
| Região | `Dropdown` (single)    | carregado da API de regiões |
| Status | `Dropdown` (single)    | Ativo, Inativo              |

### 5.8 Períodos de Inscrição (`/periods`)

| Campo       | Tipo                    | Opções           |
| ----------- | ----------------------- | ---------------- |
| Nome        | `InputText` (contains)  | livre            |
| Status      | `Dropdown` (single)     | Ativo, Encerrado |
| Data Início | `Calendar` (date range) | intervalo        |
| Data Fim    | `Calendar` (date range) | intervalo        |

## 6. Componente Compartilhado: `FilterDrawer`

Deve ser criado um componente reutilizável `FilterDrawer` em `src/components/FilterDrawer.jsx`.

### Props

| Prop          | Tipo       | Descrição                           |
| ------------- | ---------- | ----------------------------------- |
| `visible`     | `boolean`  | Controla a abertura/fechamento      |
| `onHide`      | `function` | Callback ao fechar                  |
| `filters`     | `array`    | Configuração dos campos de filtro   |
| `onApply`     | `function` | Callback com os valores dos filtros |
| `onClear`     | `function` | Callback para limpar filtros        |
| `activeCount` | `number`   | Badge no botão de abrir             |

### Estrutura da prop `filters`

```javascript
[
  {
    label: "Nome", // Rótulo exibido no drawer
    key: "name", // Chave enviada na query string
    type: "text", // text | dropdown | multiselect | date | date-range | boolean | number
    placeholder: "Buscar por nome...",
    options: [
      // Obrigatório para dropdown/multiselect
      { label: "Ativo", value: "1" },
      { label: "Inativo", value: "0" },
    ],
  },
];
```

## 7. Integração com a Tabela

### 7.1 Botão "Filtros"

Deve ser inserido ao lado do botão "Novo", no header da página:

```jsx
<div className="flex justify-content-between mb-3">
  <h2 className="text-xl font-bold">Alunos</h2>
  <div className="flex gap-2">
    <Button
      label="Filtros"
      icon="pi pi-filter"
      badge={activeCount}
      badgeClassName="p-badge-info"
      onClick={() => setFilterVisible(true)}
    />
    <Button label="Novo Aluno" icon="pi pi-plus" onClick={...} />
  </div>
</div>
```

### 7.2 URL State

Os filtros ativos são refletidos na URL como query parameters:

```
/students?name=joao&course_id=5&status=active
```

- Ao entrar na página com query params, os filtros são pré-carregados
- `useSearchParams` do React Router é usado para ler/escrever
- Drawer é aberto automaticamente se houver filtros na URL (opcional)

### 7.3 Chamada à API

O método `load` do repository deve aceitar parâmetros de filtro:

```javascript
const loadData = async (params = {}) => {
  try {
    const { data } = await repository.students.get(params);
    setData(data.items || data);
  } catch (e) {
    setData([]);
  }
};
```

## 8. Estados

### 8.1 Vazio (sem filtros)

Drawer fecha, botão "Filtros" sem badge, tabela exibe todos os registros.

### 8.2 Com filtros ativos

Badge numérico no botão "Filtros", tabela exibe dados filtrados, query params na URL.

### 8.3 Resultado vazio após filtro

A DataTable do PrimeReact já exibe "Nenhum registro encontrado" por padrão (`emptyMessage` pode ser customizado).

### 8.4 Erro no carregamento

A listagem é limpa e um toast/mensagem de erro é exibida.

## 9. Responsividade

| Breakpoint     | Comportamento                |
| -------------- | ---------------------------- |
| >= 1200px      | Drawer com largura de 400px  |
| 768px - 1199px | Drawer com largura de 360px  |
| < 768px        | Drawer ocupa 100% da largura |

## 10. Fluxo de Interação

```
[Usuário está na listagem]
        │
        ▼
[Clica em "Filtros"]
        │
        ▼
[Drawer abre da direita]
        │
        ▼
[Usuário preenche campos de filtro]
        │
        ▼
[Clica em "Aplicar"]
        │
        ├─► Drawer fecha
        ├─► Query params são atualizados na URL
        ├─► Tabela é recarregada com filtros
        └─► Badge exibe contagem de filtros
        │
        ▼
[Clica em "Limpar"]
        │
        ├─► Todos os campos são resetados
        ├─► Query params são removidos da URL
        ├─► Tabela recarrega sem filtros
        └─► Badge desaparece
```

## 11. Implementação Técnica

### Arquivos envolvidos

| Arquivo                           | Tipo       | Descrição                                    |
| --------------------------------- | ---------- | -------------------------------------------- |
| `src/components/FilterDrawer.jsx` | Novo       | Componente reutilizável do drawer de filtros |
| `src/components/FilterDrawer.css` | Novo       | Estilos do drawer (se necessário)            |
| `src/pages/**/*List.jsx`          | Modificado | Todas as listagens recebem o FilterDrawer    |
| `src/services/repository.js`      | Modificado | Métodos `get` aceitam parâmetros de filtro   |
| `src/services/API_routes.js`      | Modificado | Rotas podem receber query string             |

### Dependências

- `primereact/sidebar` — Drawer component (já disponível no PrimeReact)
- `react-router-dom` — `useSearchParams` para URL state (já disponível)

## 12. Convenções de Query Params e Implementação

Para padronizar o tráfego entre frontend e backend e facilitar a construção de filtros reutilizáveis, adota-se as seguintes convenções:

- Textual (contains): enviar `{key}_like=valor`. Ex.: `name_like=joao`.
- Exato: enviar `{key}=valor` (pode usar `queryKey` na configuração para forçar um nome diferente).
- Multiselect: enviar `{key}_in` com valores separados por vírgula (CSV). Ex.: `role_in=ADMIN,USER`.
- Booleanos: enviar `{key}=true|false`.
- Date (single): enviar `{key}=YYYY-MM-DD`.
- Date range: enviar `{key}_start=YYYY-MM-DD&{key}_end=YYYY-MM-DD`.

Notas de implementação:

- O componente `FilterDrawer` mapeia tipos para chaves padrão (ex.: `text` -> `{key}_like`, `multiselect` -> `{key}_in`). Se um filtro necessitar de outro nome, defina `queryKey` na configuração do filtro.
- As páginas de listagem atualmente serializam arrays para CSV ao montar `searchParams` (ex.: `value.join(',')`). Caso prefira centralizar a serialização, é possível alterar `FilterDrawer` para retornar strings em vez de arrays.
- O componente de filtro dos disciplinas está em `src/pages/Courses/CoursesFilter.jsx` e recebe `regions` via prop para montar as opções do `Dropdown`.

Exemplo de serialização antes de atualizar os query params:

```js
const params = new URLSearchParams();
Object.entries(appliedFilters).forEach(([key, value]) => {
  if (Array.isArray(value)) params.append(key, value.join(","));
  else params.append(key, value);
});
setSearchParams(params);
```

Seguindo essas regras o backend pode expor as chaves disponíveis (ex.: `filters.available: ["name_like","role_in","is_active"]`) e o frontend fará o mapeamento automaticamente.
