# API PlayBook — Formulários, Perguntas e Respostas

**Base URL:** `http://seu-dominio/api`  
**Content-Type:** `application/json`

---

## Sumário

- [Formulários (CRUD)](#formulários-crud)
- [Associar formulário ao criar/editar uma Decisão](#associar-formulário-ao-criareditaruma-decisão)
- [Associar formulário ao criar/editar um Submenu](#associar-formulário-ao-criarEditarUmSubmenu)
- [Endpoints de associação avulsa — Decisão](#endpoints-de-associação-avulsa--decisão)
- [Endpoints de associação avulsa — Submenu](#endpoints-de-associação-avulsa--submenu)
- [Perguntas](#perguntas)
- [Respostas](#respostas)
- [Interfaces TypeScript](#interfaces-typescript)

---

## Formulários (CRUD)

Formulário é uma entidade independente. Você cria uma vez e reutiliza em quantas trilhas ou submenus quiser.

---

### `GET /api/formularios`

Lista todos os formulários disponíveis (use para montar o dropdown de seleção ao cadastrar uma trilha).

**Resposta `200`:**
```json
[
  {
    "id": 1,
    "titulo": "Virtua Público-Alvo",
    "descricao": "Identifique o perfil do cliente",
    "perguntas": [
      { "id": 1, "formulario_id": 1, "texto": "Cliente trabalha em home office?", "ordem": 0 },
      { "id": 2, "formulario_id": 1, "texto": "Cliente joga online?", "ordem": 1 }
    ]
  }
]
```

---

### `GET /api/formularios/{id}`

Retorna um formulário com suas perguntas.

---

### `POST /api/formularios`

Cria um formulário. As perguntas são opcionais — podem ser criadas junto ou adicionadas depois.

**Body:**
```json
{
  "titulo": "Virtua Público-Alvo",
  "descricao": "Identifique o perfil antes de apresentar",
  "perguntas": [
    { "texto": "Cliente trabalha em home office?", "ordem": 0 },
    { "texto": "Cliente joga online?", "ordem": 1 },
    { "texto": "Cliente usa streaming?", "ordem": 2 }
  ]
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `titulo` | string | sim | |
| `descricao` | string | não | |
| `perguntas` | array | não | Cria junto com o formulário |
| `perguntas[].texto` | string | sim (se informar perguntas) | |
| `perguntas[].ordem` | integer | não | Default: índice do array |

**Resposta `201`:** formulário com perguntas.

---

### `PUT /api/formularios/{id}`

Atualiza título ou descrição.

**Body:**
```json
{ "titulo": "Novo título", "descricao": "..." }
```

**Resposta `200`:** formulário atualizado com perguntas.

---

### `DELETE /api/formularios/{id}`

Remove o formulário, suas perguntas e todas as associações com decisões/submenus.

**Resposta `200`:**
```json
{ "message": "Formulário removido com sucesso." }
```

---

## Associar formulário ao criar/editar uma Decisão

O campo `formularios` pode ser enviado diretamente no body do `POST /api/decisoes` e do `PUT /api/decisoes/{id}`. Envie um array de IDs na ordem em que devem aparecer.

---

### `POST /api/decisoes`

**Body (exemplo com formulários):**
```json
{
  "descricao": "Qual é o perfil do cliente?",
  "titulo": "Perfil",
  "id_pai": null,
  "ordem": 0,
  "formularios": [1, 3]
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `descricao` | string | sim | |
| `titulo` | string | não | |
| `id_pai` | integer | não | ID da decisão pai |
| `go_to` | string | não | IDs separados por vírgula para redirecionar |
| `ordem` | integer | não | |
| `arquivos[]` | file | não | `multipart/form-data`, aceita PDF/JPEG/PNG/GIF |
| `produtos` | array | não | Ver docs de produtos |
| `formularios` | array de integers | não | IDs dos formulários a associar, na ordem desejada |

**Resposta `201`:**
```json
{
  "id": 5,
  "descricao": "Qual é o perfil do cliente?",
  "titulo": "Perfil",
  "id_pai": null,
  "go_to": null,
  "ordem": 0,
  "documentos": [],
  "produtos": [],
  "formularios": [
    {
      "id": 1,
      "titulo": "Virtua Público-Alvo",
      "descricao": "...",
      "pivot": { "decisao_id": 5, "formulario_id": 1, "ordem": 0 },
      "perguntas": [
        { "id": 1, "texto": "Cliente trabalha em home office?", "ordem": 0 }
      ]
    },
    {
      "id": 3,
      "titulo": "Outro Formulário",
      "descricao": "...",
      "pivot": { "decisao_id": 5, "formulario_id": 3, "ordem": 1 },
      "perguntas": [...]
    }
  ]
}
```

---

### `PUT /api/decisoes/{id}` · `POST /api/decisoes/{id}`

Mesmos campos do `POST`. Para o campo `formularios`:

- **Não enviado:** formulários existentes ficam intactos.
- **`"formularios": [2, 1]`:** substitui todas as associações pelos IDs informados, na ordem do array.
- **`"formularios": []`:** remove todas as associações de formulários desta decisão.

> Use `POST /api/decisoes/{id}` quando precisar enviar arquivos via `multipart/form-data` junto com os formulários.

---

## Associar formulário ao criar/editar um Submenu

Mesmo comportamento da decisão. O campo `formularios` pode ser enviado no body do `POST /api/submenus` e do `PUT /api/submenus/{id}`.

---

### `POST /api/submenus`

**Body (exemplo com formulários):**
```json
{
  "decisao_id": 5,
  "titulo": "Materiais de Apoio",
  "descricao": "Conteúdo complementar",
  "ordem": 1,
  "formularios": [2]
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `decisao_id` | integer | sim | |
| `titulo` | string | sim | |
| `descricao` | string | não | |
| `ordem` | integer | não | Default: último da fila |
| `arquivos[]` | file | não | `multipart/form-data`, aceita PDF/JPEG/PNG/GIF/DOC/DOCX/XLS/XLSX |
| `formularios` | array de integers | não | IDs dos formulários a associar, na ordem desejada |

**Resposta `201`:**
```json
{
  "id": 10,
  "decisao_id": 5,
  "titulo": "Materiais de Apoio",
  "descricao": "Conteúdo complementar",
  "ordem": 1,
  "documentos": [],
  "formularios": [
    {
      "id": 2,
      "titulo": "Checklist de Vendas",
      "descricao": "...",
      "pivot": { "submenu_id": 10, "formulario_id": 2, "ordem": 0 },
      "perguntas": [
        { "id": 5, "texto": "Cliente já conhece o produto?", "ordem": 0 }
      ]
    }
  ]
}
```

---

### `PUT /api/submenus/{id}` · `POST /api/submenus/{id}`

Mesmos campos do `POST`. Comportamento do campo `formularios` idêntico ao da decisão:

- **Não enviado:** formulários existentes ficam intactos.
- **`"formularios": [2, 1]`:** substitui todas as associações.
- **`"formularios": []`:** remove todas as associações.

---

## Endpoints de associação avulsa — Decisão

Use estes endpoints para adicionar ou remover um formulário de uma decisão já existente sem precisar reenviar todos os dados da decisão.

---

### `GET /api/decisoes/{decisao_id}/formularios`

Lista os formulários associados a uma decisão, na ordem cadastrada.

**Resposta `200`:**
```json
[
  {
    "id": 1,
    "titulo": "Virtua Público-Alvo",
    "descricao": "...",
    "pivot_ordem": 0,
    "perguntas": [
      { "id": 1, "texto": "Cliente trabalha em home office?", "ordem": 0 },
      { "id": 2, "texto": "Cliente joga online?", "ordem": 1 }
    ]
  }
]
```

---

### `POST /api/decisoes/{decisao_id}/formularios`

Associa um formulário existente a uma decisão.

**Body:**
```json
{ "formulario_id": 1, "ordem": 0 }
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `formulario_id` | integer | sim | Deve existir em `GET /api/formularios` |
| `ordem` | integer | não | Default: último da fila |

**Resposta `201`:**
```json
{
  "message": "Formulário associado com sucesso.",
  "formulario": {
    "id": 1,
    "titulo": "Virtua Público-Alvo",
    "perguntas": [...]
  }
}
```

**Resposta `409`** (já associado):
```json
{ "error": "Este formulário já está associado a esta decisão." }
```

---

### `DELETE /api/decisoes/{decisao_id}/formularios/{formulario_id}`

Remove a associação. O formulário **não é deletado**, apenas desvinculado.

**Resposta `200`:**
```json
{ "message": "Formulário desassociado com sucesso." }
```

---

## Endpoints de associação avulsa — Submenu

---

### `GET /api/submenus/{submenu_id}/formularios`

Lista os formulários associados a um submenu.

**Resposta `200`:** mesma estrutura do `GET /api/decisoes/{id}/formularios`.

---

### `POST /api/submenus/{submenu_id}/formularios`

Associa um formulário a um submenu.

**Body:**
```json
{ "formulario_id": 1, "ordem": 0 }
```

**Resposta `201`:** mesma estrutura do `POST /api/decisoes/{id}/formularios`.

**Resposta `409`** (já associado):
```json
{ "error": "Este formulário já está associado a este submenu." }
```

---

### `DELETE /api/submenus/{submenu_id}/formularios/{formulario_id}`

Remove a associação do formulário com o submenu.

**Resposta `200`:**
```json
{ "message": "Formulário desassociado com sucesso." }
```

---

## Perguntas

---

### `POST /api/formularios/{formulario_id}/perguntas`

Adiciona uma ou várias perguntas a um formulário.

**Formato único:**
```json
{ "texto": "Cliente possui dispositivos inteligentes em casa?", "ordem": 3 }
```

**Formato múltiplo:**
```json
{
  "perguntas": [
    { "texto": "Cliente insatisfeito com a velocidade atual?", "ordem": 3 },
    { "texto": "Pequenos negócios que dependem da internet?", "ordem": 4 }
  ]
}
```

**Resposta `201`:** a pergunta criada (formato único) ou array de perguntas (formato múltiplo).

---

### `PUT /api/perguntas/{id}`

Atualiza texto ou ordem de uma pergunta.

**Body:**
```json
{ "texto": "Novo texto da pergunta", "ordem": 2 }
```

---

### `DELETE /api/perguntas/{id}`

Remove a pergunta. Respostas vinculadas são removidas em cascade.

**Resposta `200`:**
```json
{ "message": "Pergunta removida com sucesso." }
```

---

### `PUT /api/formularios/{formulario_id}/perguntas/reordenar`

Reordena as perguntas de um formulário.

**Body:**
```json
{
  "perguntas": [
    { "id": 3, "ordem": 0 },
    { "id": 1, "ordem": 1 },
    { "id": 2, "ordem": 2 }
  ]
}
```

**Resposta `200`:** formulário com perguntas na nova ordem.

---

## Respostas

Registra o resultado de um atendimento — quais perguntas foram respondidas com sim ou não.

---

### `POST /api/formularios/{formulario_id}/respostas`

Salva as respostas de um atendimento.

**Body:**
```json
{
  "user_id": 3,
  "respostas": [
    { "pergunta_id": 1, "valor": true },
    { "pergunta_id": 2, "valor": false },
    { "pergunta_id": 3, "valor": true }
  ]
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `user_id` | integer | não | Quando auth for implementado, vira automático |
| `respostas` | array | sim | |
| `respostas[].pergunta_id` | integer | sim | Deve pertencer ao formulário |
| `respostas[].valor` | boolean | sim | `true` = Sim, `false` = Não |

**Resposta `201`:**
```json
{
  "id": 1,
  "formulario_id": 1,
  "user_id": 3,
  "created_at": "2026-06-26T14:30:00.000000Z",
  "user": { "id": 3, "name": "Rafael", "email": "rafael@..." },
  "itens": [
    {
      "id": 1,
      "pergunta_id": 1,
      "valor": true,
      "pergunta": { "id": 1, "texto": "Cliente trabalha em home office?", "ordem": 0 }
    },
    {
      "id": 2,
      "pergunta_id": 2,
      "valor": false,
      "pergunta": { "id": 2, "texto": "Cliente joga online?", "ordem": 1 }
    }
  ]
}
```

**Resposta `422`** (pergunta de outro formulário):
```json
{ "error": "A pergunta 99 não pertence a este formulário." }
```

---

### `GET /api/formularios/{formulario_id}/respostas`

Histórico de atendimentos, do mais recente ao mais antigo.

**Resposta `200`:** array com a mesma estrutura do `POST`.

---

## Interfaces TypeScript

```ts
interface Formulario {
  id: number
  titulo: string
  descricao: string | null
  perguntas: Pergunta[]
  pivot?: {
    decisao_id?: number
    submenu_id?: number
    formulario_id: number
    ordem: number
  }
  /** Presente apenas quando vem de GET /decisoes/{id}/formularios ou GET /submenus/{id}/formularios */
  pivot_ordem?: number
}

interface Pergunta {
  id: number
  formulario_id: number
  texto: string
  ordem: number
}

interface Resposta {
  id: number
  formulario_id: number
  user_id: number | null
  created_at: string
  user: { id: number; name: string; email: string } | null
  itens: RespostaItem[]
}

interface RespostaItem {
  id: number
  resposta_id: number
  pergunta_id: number
  valor: boolean  // true = Sim, false = Não
  pergunta: Pergunta
}

// Campo formularios nos payloads de criação/edição
interface DecisaoPayload {
  descricao: string
  titulo?: string
  id_pai?: number | null
  go_to?: string | null
  ordem?: number
  formularios?: number[]  // array de IDs; omitir = não altera; [] = remove todos
}

interface SubmenuPayload {
  decisao_id: number       // obrigatório apenas no POST
  titulo: string
  descricao?: string
  ordem?: number
  formularios?: number[]   // array de IDs; omitir = não altera; [] = remove todos
}
```
