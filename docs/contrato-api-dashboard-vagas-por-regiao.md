# Contrato de API — Dashboard: Vagas por Território

**Responsável frontend:** nepsFront  
**Data:** 2026-06-19  
**Contexto:** O dashboard da home exibe um gráfico pizza com a quantidade total de vagas (capacidade das salas) agrupada por região. O frontend tenta consumir o endpoint dedicado abaixo; se ele retornar erro, cai para um fallback que compõe os dados chamando três endpoints separados.

---

## Endpoint necessário

### `GET /v1/dashboard/vacancies-by-region`

Retorna a soma da capacidade total de salas agrupada por região.

**Autenticação:** Bearer token (obrigatório)  
**Permissão mínima:** qualquer usuário autenticado (`ADMIN`, `CAMPO_ESTAGIO`, `INSTITUICAO_ENSINO`)

**Sem parâmetros.**

**Response `200`:**

```json
{
  "items": [
    {
      "region_id": 1,
      "region_name": "Território Norte",
      "vacancies": 45
    },
    {
      "region_id": 2,
      "region_name": "Território Sul",
      "vacancies": 30
    },
    {
      "region_id": 3,
      "region_name": "Território Centro",
      "vacancies": 12
    }
  ]
}
```

**Campos do item:**

| Campo         | Tipo   | Descrição                                                                                                 |
| ------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `region_id`   | int    | ID da região                                                                                              |
| `region_name` | string | Nome da região (usado como label no gráfico)                                                              |
| `vacancies`   | int    | Soma da capacidade (`room_capacity`) de todas as salas ativas vinculadas a campos de estágio desta região |

**Regras de cálculo:**

```
vagas_por_região = SUM(room.room_capacity)
  WHERE room.is_active = true
    AND room.internship.region_id = region.id
```

- Só incluir salas com `is_active = true`
- Só incluir campos de estágio com `is_active = true`
- Territórios sem nenhuma sala ativa podem ser omitidas do resultado (o frontend ignora itens com `vacancies = 0`)
- Ordenar por `vacancies DESC` (opcional, facilita leitura)

**Erros esperados:**

| Status | Situação                                                      |
| ------ | ------------------------------------------------------------- |
| `401`  | Token ausente ou inválido                                     |
| `500`  | Erro interno — o frontend cai para o fallback automaticamente |

---

## Fallback do frontend (sem o endpoint dedicado)

Se `GET /v1/dashboard/vacancies-by-region` falhar, o frontend compõe os dados fazendo **3 chamadas em paralelo**:

```
GET  /v1/regions              → lista todas as regiões
GET  /v1/internships?per_page=500   → lista campos de estágio (tem region_id)
GET  /v1/rooms?per_page=500         → lista salas (tem internships_id e room_capacity)
```

Lógica de cruzamento no frontend:

```
internship_region_map = { internship.id → internship.region_id }

para cada sala:
  region_id = internship_region_map[sala.internships_id]
  region_capacity[region_id] += sala.room_capacity

para cada região:
  if region_capacity[region.id] > 0:
    adiciona ao gráfico { label: region.name, value: region_capacity[region.id] }
```

O endpoint dedicado elimina essas 3 chamadas e o processamento no cliente — **recomendado implementar**.

---

## Modelo de dados relacionado

**Room (sala):**

```json
{
  "id": 5,
  "name": "Sala A",
  "internships_id": 10,
  "room_capacity": 8,
  "is_active": true
}
```

**Internship (campo de estágio):**

```json
{
  "id": 10,
  "name": "UBS Centro",
  "region_id": 2,
  "is_active": true
}
```

**Region:**

```json
{
  "id": 2,
  "name": "Território Sul"
}
```

**Relação:**

```
Region (1) ←── (N) Internship (1) ←── (N) Room
```

---

## Como o frontend consome o response

O frontend aceita os seguintes nomes de campo (qualquer um serve):

| Campo no response | Alternativas aceitas          |
| ----------------- | ----------------------------- |
| `region_name`     | `name`                        |
| `vacancies`       | `total_vacancies`, `capacity` |

Exemplo mínimo válido:

```json
{ "items": [{ "name": "Norte", "vacancies": 45 }] }
```

Exemplo completo recomendado:

```json
{ "items": [{ "region_id": 1, "region_name": "Norte", "vacancies": 45 }] }
```
