# Contrato de API — Dashboard: Alunos Vinculados por Instituição de Ensino

**Data:** 2026-06-19  
**Contexto:** O dashboard exibe um gráfico pizza com o percentual de alunos vinculados a um campo de estágio (`internship_id IS NOT NULL`), agrupado por instituição de ensino.

---

## Endpoint

```
GET /v1/dashboard/students-by-institution
```

**Autenticação:** Bearer token (obrigatório)  
**Permissão mínima:** qualquer usuário autenticado

**Sem parâmetros.**

**Response `200`:**
```json
{
  "items": [
    {
      "institution_id": 1,
      "institution_name": "UNIFASC",
      "student_count": 12
    },
    {
      "institution_id": 2,
      "institution_name": "UNIP",
      "student_count": 8
    },
    {
      "institution_id": 3,
      "institution_name": "UNINOVAFAPI",
      "student_count": 5
    }
  ]
}
```

**Campos do item:**

| Campo | Tipo | Descrição |
|---|---|---|
| `institution_id` | int | ID da instituição de ensino |
| `institution_name` | string | Nome da instituição (usado como label no gráfico) |
| `student_count` | int | Quantidade de alunos com `internship_id IS NOT NULL` vinculados a esta instituição |

---

## Regras de cálculo

```sql
SELECT
  ei.id            AS institution_id,
  ei.name          AS institution_name,
  COUNT(s.id)      AS student_count
FROM students s
JOIN education_institutes ei ON s.institution_id = ei.id
WHERE s.internship_id IS NOT NULL
GROUP BY ei.id, ei.name
ORDER BY student_count DESC
```

- Contar apenas alunos com `internship_id IS NOT NULL` (vinculados a um campo de estágio)
- Instituições sem nenhum aluno vinculado podem ser omitidas do resultado
- Ordenar por `student_count DESC`

---

## Erros esperados

| Status | Situação |
|---|---|
| `401` | Token ausente ou inválido |
| `200` com `items: []` | Nenhum aluno vinculado ainda — o frontend exibe mensagem vazia |

---

## Como o frontend consome o response

O frontend aceita os seguintes nomes de campo:

| Campo esperado | Alternativas aceitas |
|---|---|
| `institution_name` | `name` |
| `student_count` | `total`, `count` |

Exemplo mínimo válido:
```json
{ "items": [{ "name": "UNIFASC", "count": 12 }] }
```

Exemplo completo recomendado:
```json
{ "items": [{ "institution_id": 1, "institution_name": "UNIFASC", "student_count": 12 }] }
```
