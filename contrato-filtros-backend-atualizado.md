# Contrato Atualizado de Filtros em Listagens (Query Params na URL)

## 1. Visão Geral

Conforme a padronização REST do sistema, as requisições de listagem (ex: `GET /v1/periods`, `GET /v1/students`) **devem receber os parâmetros de filtro e paginação na URL (Query String)**, e não mais no corpo da requisição.

O backend precisa estar preparado para ler os parâmetros da URL (`request.query`) dessas requisições de listagem e aplicar as cláusulas de banco de dados correspondentes antes de retornar os dados.

## 2. Formato dos Parâmetros (Requisição)

O frontend envia os dados de paginação e os filtros aplicados pelo usuário diretamente na URL.

**Exemplo de requisição enviada pelo Frontend:**
```http
GET /v1/periods?page=1&per_page=10&name_like=2026&is_active=1&institution_id=5
```

## 3. Padrão de Nomenclatura e Operadores

O frontend utiliza sufixos nas chaves da URL para indicar ao backend qual operação SQL deve ser realizada. O backend deve mapear esses sufixos conforme a tabela abaixo:

| Sufixo no Parâmetro | Tipo de Filtro | Operação SQL Esperada | Exemplo na URL |
| :--- | :--- | :--- | :--- |
| `_like` | Texto (Parcial) | `ILIKE '%valor%'` (Case-insensitive) | `name_like=maria` |
| `_in` | Múltipla escolha | `IN (val1, val2)` | `status_in=ACTIVE,PENDING` |
| `_from` / `_start` | Data/Número (Início) | `>= 'valor'` | `start_date_from=2026-01-01`|
| `_to` / `_end` | Data/Número (Fim) | `<= 'valor'` | `end_date_to=2026-12-31` |
| `_min` | Range Numérico | `>= valor` | `capacity_min=10` |
| `_max` | Range Numérico | `<= valor` | `capacity_max=50` |
| *(sem sufixo)* | Exato (Match) | `= 'valor'` | `is_active=1` ou `institution_id=5` |

## 4. Casos Práticos de Implementação

### Caso 1: Tela de Períodos de Inscrição (`/periods`)

Quando um usuário do tipo **Instituição de Ensino** acessa a listagem de períodos, o frontend envia obrigatoriamente:
```http
GET /v1/periods?page=1&per_page=10&is_active=1&institution_id=42
```
* **Regra no Backend:** A query deve filtrar `WHERE is_active = true AND institution_id = 42`.

Se o usuário buscar por nome no drawer de filtros, o payload será:
```http
GET /v1/periods?page=1&per_page=10&is_active=1&institution_id=42&name_like=2026.1
```
* **Regra no Backend:** A query deve adicionar `AND name ILIKE '%2026.1%'`.

### Caso 2: Tela de Gestão de Alunos com arrays (`/students`)

Se houver múltiplos filtros aplicados (ex: várias disciplinas selecionadas):
```http
GET /v1/students?page=1&per_page=20&discipline_id_in=5,8,12&name_like=joão
```
* **Regra no Backend:** O backend deve separar a string `discipline_id_in` por vírgula e aplicar `WHERE discipline_id IN (5, 8, 12) AND name ILIKE '%joão%'`.

## 5. Formato de Resposta Esperado

A estrutura de resposta do backend **deve permanecer inalterada**, encapsulando os itens em uma propriedade `items` ou `data` e retornando a paginação:

```json
{
  "items": [
    {
      "id": 1,
      "name": "2026.1",
      "start_date": "2026-01-16",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 12,
    "total_pages": 2
  }
}
```

## 6. Check-list de Correção de Bugs (Troubleshooting)

Se o frontend aplica o filtro mas os dados não mudam, verifique:
1. O backend está lendo a chave correta na URL (`req.query`)? (Ex: o frontend manda `name_like`, e o backend está buscando apenas por `name`).
2. Filtros booleanos como `is_active=1` estão sendo devidamente convertidos para `true` no banco?