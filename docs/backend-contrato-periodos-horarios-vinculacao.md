# Contrato Backend — Horários (vagas) e vinculação de aluno a horário

Resumo

- O frontend precisa listar horários vagos em salas dos campos de estágio filtradas pela região da instituição do aluno, e permitir vincular/desvincular um aluno a um horário específico (sala, dia, período).
- Todas as rotas abaixo são consumidas sob o prefixo `/api`, portanto a forma completa esperada é `/api/v1/...`.

Endpoints exigidos

1. Listar salas por região (usado para localizar salas com horários)

- Método: GET
- Rota (sugerida): `/v1/service-rooms` com query param `region_id={id}`
- Query params opcionais: `page`, `per_page`, `internship_id`
- Resposta (200):
  {
  "items": [ { "id": 1, "name": "Sala A", "room_capacity": 10, "internship_id": 5, ... } ],
  "pagination": { "page":1, "per_page":10, "total": 42 }
  }

Observações:

- O frontend chama `repository.serviceRooms.get({ region_id })` — portanto a API deve aceitar `region_id` como query param.

2. Obter agenda/horário de uma sala

- Método: GET
- Rota: `/v1/rooms/{roomId}/schedule`
- Resposta (200) esperada (exemplo):
  {
  "days": [
  {
  "dayOfWeek": "MONDAY",
  "periods": [
  {
  "period": "MORNING",
  "studentIds": [12, 34],
  "other_meta": ".."
  },
  ...
  ]
  },
  ...
  ]
  }

Observações:

- O frontend normaliza usando `schedule.days[*].periods[*].studentIds` ou `student_ids`.
- Cada período deve expor um array com IDs dos alunos já vinculados para permitir cálculo de vagas.

3. Vincular aluno a um horário (atribuir aluno a sala/dia/período)

- Método: POST
- Rota: `/v1/rooms/{roomId}/schedule/{dayOfWeek}/{period}/student`
- Body: `{ "student_id": <number> }`
- Comportamento esperado:
  - Validações:
    - `roomId` existe.
    - `dayOfWeek` é válido (MONDAY..SUNDAY) e `period` é válido (MORNING/AFTERNOON/EVENING ou conforme contrato do sistema).
    - `student_id` existe e pertence à instituição/região esperada (se aplicável à regra de negócio).
    - A sala tem vagas para o período (capacidade - número de alunos vinculados > 0).
    - Evitar duplicidade: se o aluno já estiver vinculado ao mesmo horário, o endpoint pode ser idempotente (retornar 200 sem alterar) ou responder 409; documente a escolha.
  - Regras de concorrência: operação deve ser segura contra condições de corrida — usar transação/lock e/ou constraint única `(roomId, dayOfWeek, period, student_id)` para evitar overbooking.
  - Respostas:
    - 201 Created (ou 200 OK) com o recurso atualizado ou confirmação simples
    - 400 Bad Request para payload inválido
    - 404 Not Found se room/period não existir
    - 409 Conflict se não houver vagas (ou se já vinculado — dependendo da política)

Exemplo resposta (201):
{ "ok": true, "message": "Aluno vinculado", "assigned": { "room_id": 1, "dayOfWeek": "MONDAY", "period": "MORNING", "student_id": 12 } }

4. Desvincular aluno de um horário

- Método: DELETE
- Rota: `/v1/rooms/{roomId}/schedule/{dayOfWeek}/{period}/student`
- Body: `{ "student_id": <number> }` (ou alternativamente `DELETE /v1/rooms/{roomId}/schedule/{dayOfWeek}/{period}/student/{studentId}`)
- Comportamento esperado:
  - Remove associação do aluno ao horário
  - Respostas: 200 OK (ou 204 No Content) em sucesso, 404 se associação não encontrada, 400/403 conforme validação

Regras de negócio / validações importantes

- Capacidade: verificar `room.room_capacity` (ou `capacity`) para calcular vagas. Se a sala não informa capacidade, permitir vinculação, mas documentar esse comportamento.
- Escopo regional: o frontend carrega salas pela `region_id` extraída de `student.institution.region_id`. Se o backend não possuir `region_id` diretamente em `institution`, expor rota(s) apropriadas para mapear instituição → região.
- Permissões: somente usuários autorizados (ADMIN, ou usuário da instituição/região com permissão) devem conseguir vincular/desvincular. Retornar 403 quando usuário não puder executar ação.
- Idempotência: decidir política para POST quando aluno já vinculado. Recomendação: tornar idempotente e retornar 200/201 sem duplicar.
- Consistência: usar transação para garantir que vagas não sejam ultrapassadas por concorrência.

Recomendações de implementação (banco e integridade)

- Adicionar uma tabela `room_schedule_assignments` com colunas: `id`, `room_id`, `day_of_week`, `period`, `student_id`, `created_at`.
- Índice único em (`room_id`, `day_of_week`, `period`, `student_id`) para evitar duplicidade.
- Ao inserir, checar count(assignments) para o slot e comparar com a capacidade da sala dentro de transação.

Exemplos de fluxo front-end (para validar contrato)

- Carregar salas da região do aluno:
  GET `/v1/service-rooms?region_id=5`

- Para cada sala obtida: GET `/v1/rooms/{roomId}/schedule` → calcular vagas por período = `room_capacity - (period.studentIds || []).length`.

- Vincular aluno ao slot escolhido:
  POST `/v1/rooms/12/schedule/MONDAY/MORNING/student` { "student_id": 34 }

Testes de aceitação

- Unit/integration tests que cobrem:
  - inclusão bem-sucedida quando há vaga
  - recusa quando capacidade cheia
  - idempotência (repetir POST não duplica)
  - remoção bem-sucedida e recuperação de vaga
  - permissões (403 para usuário não autorizado)

Notas finais

- O frontend atual espera as rotas usadas em `repository.serviceRooms.get(...)`, `repository.roomSchedules.get(roomId)`, `repository.roomSchedules.addStudent(...)` e `repository.roomSchedules.removeStudent(...)`.
- Alternativamente, para agenda de serviço, o backend pode expor `GET /api/v1/service-schedules/` e `GET /api/v1/service-schedules/by-room/{service_room_id}`.
- Se o backend preferir outro formato de resposta para a grade da sala, avise que o `API_ROUTES`/`repository` pode ser adaptado facilmente.
- Posso gerar exemplos de testes API (curl / Postman) se quiserem.

Filtro de alunos na tela de gestão do período

- Na tela `/periods/{period_id}/manage`, o frontend aplica filtro local sobre a lista de alunos retornada por `GET /api/v1/periods/{period_id}?include=students`.
- Para o filtro funcionar de forma confiável, cada aluno retornado deve incluir um indicador explícito de vínculo com horário, preferencialmente:
  - `has_slot: true|false`
- Campos aceitos pelo frontend como fallback:
  - `has_slot`
  - `has_schedule`
  - `room_schedule_id`
  - `schedule_id`
  - `slot_id`
  - objetos/arrays como `slot`, `slots`, `schedule`, `schedules`, `room_schedule`, `room_schedules`, `linked_slot`, `linked_slots`, `assigned_slot`, `assigned_slots`, `assignment`, `assignments`

Contrato recomendado para o backend

- Em `GET /api/v1/periods/{period_id}?include=students`, retornar cada aluno com:
  - dados básicos do aluno (`id`, `name`, `cpf`, `semester`, etc.)
  - `discipline` e `institution` quando disponíveis
  - `has_slot` calculado a partir da existência de vínculo com horário
  - opcionalmente um objeto `slot` com o vínculo atual:
    - `room_id`
    - `room_name`
    - `day_of_week`
    - `period`

Exemplo de aluno com vínculo

```json
{
  "id": 2,
  "name": "Maria Silva",
  "cpf": "00000000000",
  "semester": 3,
  "discipline": { "id": 1, "name": "Teste" },
  "institution": { "id": 1, "name": "Instituição X" },
  "has_slot": true,
  "slot": {
    "room_id": 1,
    "room_name": "Sala A",
    "day_of_week": "FRIDAY",
    "period": "EVENING"
  }
}
```

Exemplo de aluno sem vínculo

```json
{
  "id": 3,
  "name": "João Souza",
  "cpf": "11111111111",
  "semester": 2,
  "discipline": { "id": 1, "name": "Teste" },
  "institution": { "id": 1, "name": "Instituição X" },
  "has_slot": false,
  "slot": null
}
```

Se o backend preferir filtrar no servidor

- A API pode aceitar query params adicionais em `GET /api/v1/periods/{period_id}?include=students`:
  - `name` para busca textual
  - `slot_link=without|with|all`
- Com isso, o backend pode devolver apenas os alunos compatíveis com o filtro aplicado no frontend.

Regra mínima para corrigir o filtro atual

- Garantir que o payload de alunos inclua `has_slot` (ou equivalente) preenchido corretamente.
- Sem esse campo, o filtro "Sem vínculo" pode não distinguir com precisão alunos com e sem horário.

Fluxo recomendado para "horários disponíveis para o aluno"

1. Buscar as salas da região da instituição do aluno.
2. Para cada sala, chamar `GET /api/v1/rooms/{room_id}/schedule`.
3. Filtrar localmente os períodos com vagas disponíveis.
4. Para vincular, chamar `POST /api/v1/rooms/{room_id}/schedule/{day_of_week}/{period}/student` com `{ "student_id": <id> }`.
5. Para remover, chamar `DELETE /api/v1/rooms/{room_id}/schedule/{day_of_week}/{period}/student` com `{ "student_id": <id> }`.

\*\*\* Fim do documento
