# Contrato de Backend — Períodos de Inscrição e Vínculo de Alunos

Este documento descreve os endpoints e formatos esperados pelo frontend para a tela de **Períodos de Inscrição** (`/periods`) e para a gestão de alunos vinculados ao período, usada por usuários com permissão de **Instituição de Ensino**.

## 1. Objetivo

Permitir que a listagem de períodos exiba:

- os períodos cadastrados;
- o período ativo da instituição;
- os alunos já vinculados ao período;
- a ação de vincular um aluno diretamente ao período;
- a ação de desvincular um aluno do período.

Além disso, para usuários com permissão de **Administrador**, a ação de gestão do período deve abrir uma tela dedicada com todos os alunos vinculados ao período selecionado.

## 2. Endpoints necessários

### 2.1 Listar períodos

```http
GET /v1/periods?page=1&per_page=10
```

#### Filtros esperados

- `name_like`
- `is_active`
- `start_date_from`
- `start_date_to`
- `end_date_from`
- `end_date_to`
- `institution_id` quando aplicável

#### Resposta esperada

```json
{
  "items": [
    {
      "id": 1,
      "name": "2026.1",
      "priority_start_date": "2026-01-01",
      "priority_end_date": "2026-01-15",
      "start_date": "2026-01-16",
      "end_date": "2026-02-15",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### 2.2 Buscar período por ID com vínculos

```http
GET /v1/periods/{id}?include=students
```

#### Resposta esperada

O backend pode retornar os alunos vinculados de uma das duas formas abaixo:

#### Opção A — lista de objetos completos

```json
{
  "id": 1,
  "name": "2026.1",
  "students": [
    {
      "id": 10,
      "name": "Maria Silva",
      "cpf": "12345678900",
      "discipline": {
        "id": 5,
        "name": "Enfermagem"
      },
      "institution": {
        "id": 2,
        "name": "Instituto X"
      }
    }
  ]
}
```

#### Opção B — lista de IDs

```json
{
  "id": 1,
  "name": "2026.1",
  "student_ids": [10, 11, 12]
}
```

Se o backend retornar apenas IDs, o frontend pode buscar os detalhes individualmente por aluno.

### 2.2.1 Tela administrativa de gestão do período

Para a rota de gestão administrativa, o frontend consome o mesmo retorno de `GET /v1/periods/{id}?include=students` e renderiza apenas a listagem dos alunos vinculados.

Essa tela é acessível em:

```http
GET /periods/{id}/manage
```

O backend não precisa expor um endpoint novo para essa tela, desde que o endpoint de período por ID devolva os alunos vinculados no formato descrito acima.

### 2.3 Listar alunos de uma instituição

```http
GET /v1/gestao/students?institution_id={institutionId}&include=discipline,institution
```

#### Resposta esperada

```json
{
  "items": [
    {
      "id": 10,
      "name": "Maria Silva",
      "cpf": "12345678900",
      "discipline_id": 5,
      "institution_id": 2,
      "discipline": {
        "id": 5,
        "name": "Enfermagem"
      },
      "institution": {
        "id": 2,
        "name": "Instituto X"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### 2.4 Vincular aluno ao período

```http
POST /v1/periods/{id}/students
Content-Type: application/json
```

#### Body

```json
{
  "student_id": 10
}
```

#### Resposta esperada

```json
{
  "message": "Aluno vinculado com sucesso"
}
```

### 2.5 Desvincular aluno do período

```http
DELETE /v1/periods/{id}/students
Content-Type: application/json
```

#### Body

```json
{
  "student_id": 10
}
```

#### Resposta esperada

```json
{
  "message": "Aluno desvinculado com sucesso"
}
```

## 3. Regras de negócio esperadas

### 3.1 Instituição de Ensino

Para usuários com permissão de **Instituição de Ensino**:

- a listagem de períodos deve exibir apenas períodos ativos e dentro da janela de prioridade;
- o período ativo deve exibir os alunos vinculados;
- deve ser possível vincular alunos disponíveis da própria instituição;
- deve ser possível desvincular alunos do período ativo.

### 3.2 Validações recomendadas

O backend deve validar:

- se o período existe;
- se o aluno existe;
- se o aluno pertence à instituição correta;
- se o aluno já não está vinculado ao período;
- se o período está ativo e dentro da janela permitida para a instituição.

### 3.3 Códigos de resposta sugeridos

- `200 OK` para consultas e desvinculação bem-sucedida;
- `201 Created` para vínculo bem-sucedido;
- `400 Bad Request` para payload inválido;
- `404 Not Found` para período/aluno inexistente;
- `409 Conflict` para aluno já vinculado;
- `422 Unprocessable Entity` para validação de regra de negócio;
- `401 Unauthorized` / `403 Forbidden` para autenticação ou permissão.

## 4. Observações de integração

O frontend já está preparado para:

- chamar `GET /v1/periods` com filtros de paginação;
- chamar `GET /v1/periods/{id}?include=students`;
- chamar `GET /v1/gestao/students?institution_id={id}&include=discipline,institution`;
- chamar `POST /v1/periods/{id}/students`;
- chamar `DELETE /v1/periods/{id}/students`.

Se o backend usar nomes diferentes para os relacionamentos, é necessário alinhar a resposta para manter compatibilidade com a tela de períodos.

## 5. Implementação esperada no backend

Para que a funcionalidade funcione corretamente, o backend deve implementar o comportamento abaixo.

### 5.1 Modelo de relacionamento

O recurso de período precisa manter o relacionamento com alunos de forma persistente.

- um período pode possuir vários alunos vinculados;
- um aluno pode estar vinculado a um período por vez, se essa for a regra de negócio adotada;
- o backend deve expor a relação na leitura do período, seja por `students`, `student_ids` ou formato equivalente previamente acordado.

### 5.2 Leitura do período com alunos

Ao consultar um período por ID com `include=students`, o backend deve retornar a lista completa de alunos vinculados ou, no mínimo, seus IDs.

Se retornar apenas IDs, o frontend fará requisições adicionais para obter os detalhes dos alunos.

### 5.3 Filtro de alunos da instituição

Ao listar alunos para a instituição de ensino, o backend deve considerar o escopo da instituição do usuário autenticado e devolver apenas alunos pertencentes àquela instituição.

O endpoint deve suportar `include=discipline,institution` para que o frontend consiga renderizar nome do disciplina e nome da instituição sem chamadas extras.

### 5.4 Vincular aluno ao período

O backend deve aceitar a requisição de vínculo de aluno ao período e validar:

- se o período existe;
- se o aluno existe;
- se o período está ativo;
- se a janela de prioridade permite o vínculo;
- se o aluno pertence à instituição correta;
- se o aluno já não está vinculado ao período.

Em caso de sucesso, retornar confirmação explícita e persistir o vínculo.

### 5.5 Desvincular aluno do período

O backend deve aceitar a remoção do vínculo entre aluno e período, validando a existência da associação.

Em caso de sucesso, retornar confirmação explícita e remover a associação persistida.

### 5.6 Gestão administrativa

Para usuários com permissão de administrador, a tela de gestão do período precisa exibir todos os alunos já vinculados ao período selecionado.

Isso não exige endpoint novo se o backend já entregar o período com seus alunos vinculados no formato descrito acima.

### 5.7 Critérios de aceite

Considera-se a implementação concluída quando:

- a listagem de períodos funciona normalmente para todos os perfis;
- usuários de instituição de ensino veem apenas períodos válidos para sua janela de prioridade;
- a tela administrativa de gestão do período mostra todos os alunos vinculados;
- é possível vincular um aluno ao período;
- é possível desvincular um aluno do período;
- o frontend consegue obter disciplina e instituição do aluno sem request adicional na listagem de alunos.
