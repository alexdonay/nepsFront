# Contrato de API — Fluxo de Vinculação de Aluno ao Campo de Estágio

**Responsável frontend:** nepsFront  
**Data:** 2026-06-19  
**Contexto:** O NEPS acessa um período de estágio, visualiza os alunos cadastrados pela instituição e vincula cada aluno a um campo de estágio da mesma região da instituição do aluno.

---

## Visão geral do fluxo

```
1. NEPS acessa /periods/manage
   └─► GET  /v1/periods?            (lista períodos)

2. NEPS abre o gerenciamento de um período
   └─► POST /v1/periods/detail      (detalhe do período + alunos)

3. Para cada aluno, NEPS abre o dialog de vinculação
   └─► POST /v1/education-institutes/detail   (busca região da instituição)
   └─► POST /v1/internships/by-region         (lista campos de estágio da região)

4. NEPS seleciona o campo de estágio e confirma
   └─► POST /v1/students/link-internship      (vincula aluno ao campo)

5. (Opcional) NEPS atribui o aluno a um horário de sala
   └─► POST /v1/rooms/available-slots         (lista slots disponíveis)
   └─► POST /v1/rooms/schedule/student        (vincula aluno ao slot)
```

---

## Endpoints necessários

### 1. Listar períodos

```
GET /v1/periods
```

**Query params (opcionais):**
| Param | Tipo | Descrição |
|---|---|---|
| `page` | int | Paginação |
| `page_size` | int | Itens por página |
| `is_active` | bool | Filtrar por ativo/inativo |

**Response `200`:**

```json
{
  "items": [
    {
      "id": 1,
      "name": "Período 2025/1",
      "start_date": "2025-01-01",
      "end_date": "2025-06-30",
      "priority_start_date": "2024-12-01",
      "priority_end_date": "2024-12-31",
      "is_active": true
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 20
}
```

---

### 2. Detalhe do período com alunos

```
POST /v1/periods/detail
```

**Body:**

```json
{
  "period_id": 1,
  "include": "students"
}
```

**Response `200`:**

```json
{
  "id": 1,
  "name": "Período 2025/1",
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "is_active": true,
  "students": [
    {
      "id": 42,
      "name": "João da Silva",
      "cpf": "123.456.789-00",
      "email": "joao@email.com",
      "phone": "11999999999",
      "semester": 4,
      "institution_id": 7,
      "institution": {
        "id": 7,
        "name": "UNIFASC",
        "region_id": 3
      },
      "discipline_id": 2,
      "discipline": {
        "id": 2,
        "name": "Fisioterapia"
      },
      "internship_id": null,
      "internship_start_date": null,
      "internship_expected_end_date": null,
      "document_url": null,
      "institution_document_url": "https://res.cloudinary.com/...",
      "director_signed_pdf": null,
      "slot": null,
      "has_slot": false
    }
  ]
}
```

> **Importante:** O objeto de cada aluno deve incluir `institution.region_id` para que o frontend evite uma chamada extra ao endpoint de instituição. Se não vier aninhado, o frontend faz uma chamada adicional em `/v1/education-institutes/detail`.

---

### 3. Detalhe da instituição de ensino

```
POST /v1/education-institutes/detail
```

**Body:**

```json
{
  "institute_id": 7
}
```

**Response `200`:**

```json
{
  "id": 7,
  "name": "UNIFASC",
  "region_id": 3,
  "region": {
    "id": 3,
    "name": "Território Norte"
  }
}
```

> Usado apenas quando o aluno não tiver `institution.region_id` já carregado.

---

### 4. Listar campos de estágio por região ⭐ (endpoint novo)

```
POST /v1/internships/by-region
```

**Body:**

```json
{
  "region_id": 3
}
```

**Response `200`:**

```json
{
  "items": [
    {
      "id": 10,
      "name": "UBS Centro",
      "region_id": 3,
      "is_active": true
    },
    {
      "id": 11,
      "name": "Hospital Regional Norte",
      "region_id": 3,
      "is_active": true
    }
  ]
}
```

> **Regras:**
>
> - Retornar apenas campos com `is_active = true`
> - Filtrar exatamente pela `region_id` enviada
> - Se não houver campos na região, retornar `items: []` com status `200`
> - Permissão mínima: `ADMIN`

---

### 5. Vincular aluno ao campo de estágio ⭐

```
POST /v1/students/link-internship
```

**Body:**

```json
{
  "student_id": 42,
  "internship_id": 10
}
```

**Response `200`:**

```json
{
  "id": 42,
  "name": "João da Silva",
  "internship_id": 10,
  "internship": {
    "id": 10,
    "name": "UBS Centro"
  }
}
```

**Erros esperados:**

| Status | Situação                                            |
| ------ | --------------------------------------------------- |
| `400`  | `student_id` ou `internship_id` ausente ou inválido |
| `404`  | Aluno ou campo de estágio não encontrado            |
| `422`  | Campo de estágio está inativo                       |

> **Regras de negócio:**
>
> - Se o aluno já tiver `internship_id`, o novo valor **substitui** o anterior (não é erro)
> - O campo de estágio deve estar ativo (`is_active = true`)
> - Permissão mínima: `ADMIN`

---

### 6. Listar slots de horário disponíveis para o aluno

```
POST /v1/rooms/available-slots
```

**Body:**

```json
{
  "student_id": 42
}
```

**Response `200`:**

```json
{
  "items": [
    {
      "id": 5,
      "room_id": 2,
      "room_name": "Sala A",
      "day_of_week": "MONDAY",
      "period": "MORNING",
      "capacity": 5,
      "occupied": 2
    }
  ]
}
```

**Valores aceitos:**

`day_of_week`: `MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY`  
`period`: `MORNING | AFTERNOON | EVENING`

---

### 7. Vincular aluno a um slot de horário

```
POST /v1/rooms/schedule/student
```

**Body:**

```json
{
  "room_id": 2,
  "day_of_week": "MONDAY",
  "period": "MORNING",
  "period_id": 1,
  "student_id": 42
}
```

**Response `200`:** objeto do aluno atualizado ou `{ "success": true }`

---

### 8. Desvincular aluno de um slot de horário

```
DELETE /v1/rooms/schedule/student
```

**Body:**

```json
{
  "room_id": 2,
  "day_of_week": "MONDAY",
  "period": "MORNING",
  "period_id": 1,
  "student_id": 42
}
```

**Response `200`:** `{ "success": true }`

---

### 9. Atualizar dados de estágio do aluno (datas + PDF do diretor)

```
PATCH /v1/students
```

**Body:**

```json
{
  "student_id": 42,
  "director_signed_pdf": "https://res.cloudinary.com/...",
  "internship_start_date": "2025-03-01",
  "internship_expected_end_date": "2025-06-30"
}
```

**Response `200`:** objeto do aluno atualizado

---

## Modelo de dados — Student (campos relevantes ao fluxo)

```json
{
  "id": 42,
  "name": "string",
  "cpf": "string",
  "email": "string",
  "phone": "string",
  "semester": 4,

  "institution_id": 7,
  "institution": {
    "id": 7,
    "name": "string",
    "region_id": 3
  },

  "discipline_id": 2,
  "discipline": {
    "id": 2,
    "name": "string"
  },

  "internship_id": 10,
  "internship": {
    "id": 10,
    "name": "string"
  },

  "internship_start_date": "2025-03-01",
  "internship_expected_date": "2025-06-30",

  "institution_document_url": "string (URL cloudinary)",
  "document_url": "string (URL cloudinary)",
  "director_signed_pdf": "string (URL cloudinary)",

  "slot": null,
  "has_slot": false
}
```

---

## Resumo de prioridade de implementação

| #   | Endpoint                                                                             | Status                                                                 | Prioridade |
| --- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------- |
| 1   | `POST /v1/periods/detail` com `include: students` e `institution.region_id` aninhado | Deve existir — verificar se `region_id` já vem no objeto `institution` | Alta       |
| 2   | `POST /v1/internships/by-region`                                                     | **Endpoint novo**                                                      | Alta       |
| 3   | `POST /v1/students/link-internship`                                                  | Deve existir — verificar comportamento de substituição                 | Alta       |
| 4   | `POST /v1/education-institutes/detail` com `region_id`                               | Deve existir — verificar se `region_id` está no response               | Média      |
| 5   | `PATCH /v1/students` com `internship_start_date` e `director_signed_pdf`             | Deve existir                                                           | Média      |
| 6   | `POST /v1/rooms/available-slots`                                                     | Deve existir                                                           | Baixa      |
| 7   | `POST /v1/rooms/schedule/student`                                                    | Deve existir                                                           | Baixa      |
