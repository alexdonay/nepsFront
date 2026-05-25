# Padrão de Filtros em Listagens — Contrato de API (Backend)

## 1. Visão Geral

Todas as rotas de listagem (`GET`) devem aceitar **query parameters** para filtragem. O padrão segue uma convenção única para garantir consistência entre frontend e backend.

## 2. Contrato Geral

### 2.1 Método
`GET`

### 2.2 Formato dos Parâmetros

Todos os filtros são enviados como **query parameters** na URL, no formato `?chave=valor`:

```
GET /v1/students?name=joao&course_id=5&status=active
```

### 2.3 Operadores de Filtro

| Tipo de Filtro | Operador | Exemplo | Comportamento Esperado |
|---|---|---|---|
| Texto (contains) | `_like` | `?name_like=joao` | `LIKE '%joao%'` (case-insensitive) |
| Texto (exact) | valor direto | `?cpf=12345678900` | `= '12345678900'` |
| Número (exact) | valor direto | `?semester=3` | `= 3` |
| Número (range) | `_min` / `_max` | `?capacity_min=10&capacity_max=50` | `BETWEEN 10 AND 50` |
| Data (exact) | valor direto | `?start_date=2025-01-01` | `= '2025-01-01'` |
| Data (range) | `_from` / `_to` | `?start_date_from=2025-01-01&start_date_to=2025-12-31` | `BETWEEN` |
| Booleano | valor direto | `?has_gurney=true` | `= true` |
| Enum (single) | valor direto | `?status=active` | `= 'active'` |
| Enum (multiple) | `_in` com valores separados por `,` | `?role_in=admin,manager` | `IN ('admin', 'manager')` |

### 2.4 Convenção de Nomenclatura

| Convenção | Exemplo |
|---|---|
| `snake_case` | `course_id`, `start_date`, `is_active` |
| Operador `_like` para contains | `name_like`, `email_like` |
| Operador `_in` para múltiplos valores | `role_in`, `status_in` |
| Operador `_from`/`_to` para range de data | `start_date_from`, `start_date_to` |
| Operador `_min`/`_max` para range numérico | `capacity_min`, `capacity_max` |

### 2.5 Paginação

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | integer | `1` | Número da página |
| `per_page` | integer | `10` | Itens por página (máx: 100) |

### 2.6 Ordenação

| Parâmetro | Tipo | Exemplo | Descrição |
|---|---|---|---|
| `sort` | string | `?sort=name` | Campo para ordenar |
| `order` | string | `?order=asc` | `asc` ou `desc` (padrão: `asc`) |

### 2.7 Response Padrão

```json
{
  "items": [
    { "id": 1, "name": "João Silva", ... }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 42,
    "total_pages": 5
  },
  "filters": {
    "applied": ["name_like", "course_id"],
    "available": ["name", "email", "course_id", "institution_id", "semester"]
  }
}
```

> **Nota:** O campo `filters.available` é opcional, mas recomendado para que o frontend possa exibir dinamicamente os filtros disponíveis ou validar o que foi aplicado.

## 3. Filtros por Recurso

### 3.1 Estudantes — `GET /v1/students`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=joao` |
| `cpf` | texto | exact | `?cpf=12345678900` |
| `email_like` | texto | contains | `?email_like=gmail` |
| `course_id` | integer | exact | `?course_id=5` |
| `institution_id` | integer | exact | `?institution_id=2` |
| `semester` | integer | exact | `?semester=3` |

### 3.2 Usuários — `GET /v1/users`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=maria` |
| `email_like` | texto | contains | `?email_like=@email.com` |
| `role` | enum | exact | `?role=ADMIN` |
| `role_in` | enum[] | multiple | `?role_in=ADMIN,INSTITUICAO_ENSINO` |
| `is_active` | boolean | exact | `?is_active=true` |

### 3.3 Instituições — `GET /v1/cadastros/institutions`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=escola` |
| `cnpj` | texto | exact | `?cnpj=11222333000181` |
| `is_active` | boolean | exact | `?is_active=true` |
| `priority` | integer | exact | `?priority=0` |

### 3.4 Cursos — `GET /v1/courses`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=enfermagem` |
| `code_like` | texto | contains | `?code_like=ENF` |
| `region_id` | integer | exact | `?region_id=3` |

### 3.5 Salas — `GET /v1/rooms`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=sala` |
| `service_id` | integer | exact | `?service_id=5` |
| `has_gurney` | boolean | exact | `?has_gurney=true` |
| `capacity_min` | integer | range | `?capacity_min=10` |
| `capacity_max` | integer | range | `?capacity_max=50` |

### 3.6 Regiões — `GET /v1/regions`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=norte` |
| `is_active` | boolean | exact | `?is_active=true` |

### 3.7 Serviços — `GET /v1/services`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=clinico` |
| `region_id` | integer | exact | `?region_id=2` |
| `is_active` | boolean | exact | `?is_active=true` |

### 3.8 Períodos de Inscrição — `GET /v1/periods`

| Parâmetro | Tipo | Operador | Exemplo |
|---|---|---|---|
| `name_like` | texto | contains | `?name_like=2025` |
| `is_active` | boolean | exact | `?is_active=true` |
| `start_date_from` | date | range | `?start_date_from=2025-01-01` |
| `start_date_to` | date | range | `?start_date_to=2025-12-31` |
| `end_date_from` | date | range | `?end_date_from=2025-06-01` |
| `end_date_to` | date | range | `?end_date_to=2025-12-31` |

## 4. Exemplos Completos

### 4.1 Busca com múltiplos filtros + paginação + ordenação

```
GET /v1/students?
  name_like=joao&
  course_id=5&
  is_active=true&
  page=2&
  per_page=20&
  sort=name&
  order=asc
```

### 4.2 Busca com múltiplos valores (IN)

```
GET /v1/users?
  role_in=ADMIN,INSTITUICAO_ENSINO&
  page=1&
  per_page=10
```

### 4.3 Busca com range de datas

```
GET /v1/periods?
  start_date_from=2025-01-01&
  start_date_to=2025-06-30&
  page=1
```

### 4.4 Resposta vazia

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 0,
    "total_pages": 0
  },
  "filters": {
    "applied": ["name_like", "course_id"],
    "available": ["name", "email", "course_id", "institution_id", "semester"]
  }
}
```

## 5. Tratamento de Erros

### 5.1 Campo inválido

```json
{
  "error": "invalid_filter",
  "message": "O campo 'nome_errado' não é um filtro válido para este recurso",
  "valid_filters": ["name_like", "email", "course_id", "institution_id", "semester", "is_active"]
}
```

**Resposta:** `HTTP 422 Unprocessable Entity`

### 5.2 Valor inválido para enum

```json
{
  "error": "invalid_filter_value",
  "message": "O valor 'invalid_role' não é válido para o filtro 'role'. Valores válidos: ADMIN, INSTITUICAO_ENSINO, UNIDADE_SAUDE"
}
```

**Resposta:** `HTTP 422 Unprocessable Entity`

### 5.3 Formato de data inválido

```json
{
  "error": "invalid_date_format",
  "message": "O valor '01-01-2025' não é uma data válida. Use o formato YYYY-MM-DD."
}
```

**Resposta:** `HTTP 422 Unprocessable Entity`

## 6. Boas Práticas para Implementação (Backend)

1. **Ignorar parâmetros desconhecidos** — O backend deve ignorar silenciosamente parâmetros que não correspondem a filtros válidos (ao invés de retornar erro), a menos que seja explicitamente configurado para validar.

2. **Sanitização** — Todos os valores de filtro devem ser sanitizados contra SQL injection ao usar `LIKE`.

3. **Case-insensitive** — Filtros de texto com `_like` devem ser case-insensitive.

4. **Índices de banco** — Criar índices compostos para os campos mais usados em conjunto (ex: `course_id + is_active`, `region_id + is_active`).

5. **Limite de `_in`** — O operador `_in` deve aceitar no máximo 100 valores por requisição.

6. **Cache de opções** — Para filtros `Dropdown` que carregam opções de outras tabelas (cursos, regiões, instituições), endpoints separados e cacheados devem ser mantidos.

## 7. Sugestões de Endpoints de Apoio

Para popular os `Dropdown` dos filtros, o frontend precisa de endpoints que retornem as opções disponíveis. Estes endpoints já existem na maioria dos casos:

| Rota | Uso no Filtro | Já Existe |
|---|---|---|
| `GET /v1/courses` | Filtro de curso (Alunos) | Sim |
| `GET /v1/regions` | Filtro de região (Cursos, Serviços) | Sim |
| `GET /v1/services` | Filtro de serviço (Salas) | Sim |
| `GET /v1/cadastros/institutions` | Filtro de instituição (Alunos) | Sim |
| `GET /v1/users/roles` | Filtro de perfil (Usuários) | **Não** — criar |

### 7.1 Novo endpoint sugerido: `GET /v1/users/roles`

```json
{
  "items": [
    { "label": "Administrador", "value": "ADMIN" },
    { "label": "Instituição de Ensino", "value": "INSTITUICAO_ENSINO" },
    { "label": "Unidade de Saúde", "value": "UNIDADE_SAUDE" }
  ]
}
```
