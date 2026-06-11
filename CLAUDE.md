# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o projeto

Sistema de gerenciamento de playbooks de vendas. Permite criar trilhas de decisão com etapas, submenus, produtos e documentos, com suporte a upload de imagens, drag-and-drop e tema claro/escuro.

## Comandos

```bash
npm run dev        # Servidor de desenvolvimento (porta 5173)
npm run build      # Build de produção
npm run lint       # Checar código com ESLint
npm run preview    # Visualizar build de produção localmente
```

## Arquitetura

**Stack:** React 19 + Vite 7 + Tailwind CSS 4 + React Router 7

**Base path:** `/playbook/` — configurado em `vite.config.js`. Todas as rotas partem desse prefixo.

**API:** URL base em `src/config/api.js`. Produção aponta para `https://api-playbook.cellular.com.br/api`; para desenvolvimento local, trocar pelo endereço comentado no mesmo arquivo.

### Camadas da aplicação

| Camada | Localização | Responsabilidade |
|--------|-------------|------------------|
| Serviços | `src/services/` | Chamadas HTTP com Fetch API nativo |
| Hooks | `src/hooks/` | Estado e lógica de dados (`useTrilhas`, `useProdutos`) |
| Páginas | `src/pages/` | Um diretório por rota |
| Componentes | `src/components/` | Componentes reutilizáveis entre páginas |
| Contextos | `src/contexts/` | Estado global (tema claro/escuro) |

### Tema (claro/escuro)

O tema é gerenciado por `src/contexts/ThemeContext.jsx` e persistido no `localStorage`. Nunca escrever classes Tailwind de cor diretamente nos componentes — sempre importar `themeClasses` de `src/styles/theme.js`:

```js
import { themeClasses } from '../styles/theme';
const { container, text, button } = themeClasses;
```

### Serviços HTTP

- **`TrilhaService.js`** — usa `FormData` para criação e atualização (suporta upload de arquivos). Para atualizar, envia `_method=PUT` no body (padrão Laravel).
- **`ProdutoService.js`** — usa JSON puro para CRUD sem arquivos.

Ambos consomem a URL base de `src/config/api.js`.

### Drag-and-drop

Implementado com `@dnd-kit/core` e `@dnd-kit/sortable`. Ver componentes existentes como referência antes de adicionar novos comportamentos de arrastar.

### Roteamento

Rotas definidas em `src/Routes.jsx`. Para adicionar uma nova página, criar o diretório em `src/pages/` e registrar a rota nesse arquivo.
