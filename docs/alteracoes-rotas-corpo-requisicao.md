# Alteracoes de rotas para corpo da requisicao

## Contexto

O backend passou a receber identificadores e filtros no corpo da requisicao, e nao mais por parametros na URL.

## O que mudou

- Rotas de detalhe foram movidas de `/:id` para `POST /detail`.
- Rotas de listagem passaram a receber filtros no corpo do `GET`.
- Rotas de vinculacao, agenda e historico passaram a receber os IDs no corpo.
- O `repository` foi ajustado para encapsular o novo contrato.

## Principais contratos

| Recurso | Rota nova | Corpo esperado |
|---|---|---|
| Usuarios | `POST /v1/users/detail` | `{ "user_id": <id> }` |
| Cursos | `POST /v1/courses/detail` | `{ "course_id": <id> }` |
| Regioes | `POST /v1/regions/detail` | `{ "region_id": <id> }` |
| Instituicoes | `POST /v1/education-institutes/detail` | `{ "institute_id": <id> }` |
| Salas | `POST /v1/rooms/detail` | `{ "room_id": <id> }` |
| Unidades | `POST /v1/services/detail` | `{ "service_id": <id> }` |
| Alunos | `POST /v1/students/detail` | `{ "student_id": <id> }` |
| Periodos | `POST /v1/periods/detail` | `{ "period_id": <id>, "include": "students" }` |
| Salas de servico | `POST /v1/service-rooms/detail` | `{ "service_room_id": <id> }` |
| Agendas de servico | `POST /v1/service-schedules/detail` | `{ "service_schedule_id": <id> }` |

## Listagens com filtros

Os filtros continuam nas chamadas de listagem, mas agora sao enviados no corpo da requisicao.

Exemplo:

```json
{
  "page": 1,
  "per_page": 10,
  "name_like": "abc"
}
```

## Rotas de vinculacao e consulta

- `POST /v1/periods/students` com `{ "period_id": <id>, "student_id": <id> }`
- `DELETE /v1/periods/students` com `{ "period_id": <id>, "student_id": <id> }`
- `POST /v1/rooms/schedule` com `{ "room_id": <id> }`
- `POST /v1/rooms/available-slots` com `{ "student_id": <id>, "room_id": <opcional> }`
- `POST /v1/rooms/by-service` com `{ "service_id": <id> }`
- `POST /v1/students/by-course` com `{ "course_id": <id> }`
- `POST /v1/students/by-institute` com `{ "institute_id": <id> }`
- `POST /v1/histories/by-period|by-room|by-schedule|by-student` com `{ "id": <id> }`

## Cadastro de aluno

O fluxo de cadastro de aluno agora envia tambem os dados exigidos pelo vinculo de estagio:

- `document_url` continua apontando para o PDF principal do aluno.
- `director_signed_pdf` e enviado em base64 durante a criacao.
- `internship_start_date` e `internship_expected_end_date` sao enviados no formato `YYYY-MM-DD`.

Esses campos foram adicionados tanto em [src/pages/Student/StudentForm.jsx](../src/pages/Student/StudentForm.jsx) quanto no modal de cadastro rapido de [src/pages/EnrollmentPeriods/EnrollmentManageInstitution.jsx](../src/pages/EnrollmentPeriods/EnrollmentManageInstitution.jsx).

## Arquivos ajustados

- `src/services/API_routes.js`
- `src/services/repository.js`
- `src/pages/Student/StudentForm.jsx`

## Observacao

A adaptacao foi feita na camada de frontend para seguir o contrato publicado em `http://localhost:8000/docs`.
