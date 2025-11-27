# Sistema de Temas - Guia de Implementação

## ✨ Estrutura Criada

### 1. Arquivo de Configuração (`src/styles/theme.js`)
- Centraliza todas as classes de tema
- Facilita manutenção
- Evita repetição de código
- Classes prontas para usar com `dark:` do Tailwind

### 2. Context Atualizado (`src/contexts/ThemeContext.jsx`)
- Usa classe `dark` no HTML root
- Mais simples e compatível com Tailwind v4
- Persiste preferência no localStorage

### 3. CSS Global (`src/index.css`)
- Suporta dark mode do Tailwind
- Scrollbar customizada para ambos os temas
- Transições suaves automáticas

## 🎯 Como Usar

### Importar o tema:
```javascript
import { themeClasses, commonClasses } from '../styles/theme';
```

### Usar classes prontas:
```javascript
// Backgrounds
className={themeClasses.bg.primary}
className={themeClasses.bg.card}
className={themeClasses.bg.input}

// Textos
className={themeClasses.text.primary}
className={themeClasses.text.secondary}

// Bordas
className={themeClasses.border.primary}

// Classes compostas
className={commonClasses.card}
className={commonClasses.input}
className={commonClasses.button}
```

## 📋 Checklist de Componentes para Atualizar

### ✅ Já Atualizados:
- [x] ThemeContext
- [x] index.css
- [x] MenuSuperior

### 🔄 Precisam ser Atualizados:
- [ ] Home (src/pages/Home/index.jsx)
- [ ] Cadastro (src/pages/Cadastro/index.jsx)
- [ ] Trilha (src/pages/Trilha/index.jsx)
- [ ] MenuLateral (src/components/Menulateral.jsx)
- [ ] TrilhaCard (src/components/TrilhaCard.jsx)
- [ ] TrilhaForm (src/components/TrilhaForm.jsx)
- [ ] TrilhaModal (src/components/TrilhaModal.jsx)
- [ ] EtapaTreeNode (src/components/EtapaTreeNode.jsx)

## 🔧 Passos para Atualizar Cada Componente

### 1. Adicionar import:
```javascript
import { themeClasses, commonClasses } from '../styles/theme';
// ou '../../styles/theme' dependendo da localização
```

### 2. Substituir classes condicionais por classes do tema:

**Antes:**
```javascript
className={`${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
```

**Depois:**
```javascript
className={`${themeClasses.bg.card} ${themeClasses.text.primary}`}
```

### 3. Remover hook useTheme se não for mais necessário:
- Manter apenas se precisar do `isDarkMode` para lógica (ex: mudar ícones)
- A maioria dos componentes não precisa mais

## 💡 Vantagens dessa Abordagem

### ✅ Benefícios:
1. **Manutenção Centralizada**: Mudanças de cor em um único arquivo
2. **Menos Código**: Componentes mais limpos sem lógica condicional
3. **Consistência**: Mesmo tema em toda aplicação
4. **Tailwind Nativo**: Usa recursos nativos do Tailwind (`dark:`)
5. **Performance**: Menos JavaScript, mais CSS
6. **Fácil Extensão**: Adicionar novos temas é simples

### 🎨 Próximos Passos:
1. Atualizar componentes restantes usando o theme.js
2. Testar todas as telas
3. Considerar adicionar mais temas (ex: tema personalizado)
4. Documentar novos padrões para o time

## 📖 Exemplos de Conversão

### Exemplo 1 - Background Simples:
**Antes:**
```javascript
<div className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
```

**Depois:**
```javascript
<div className={themeClasses.bg.card}>
```

### Exemplo 2 - Card Completo:
**Antes:**
```javascript
<div className={`p-8 rounded-2xl shadow-2xl ${
  isDarkMode 
    ? 'bg-slate-800 border-slate-700 text-white' 
    : 'bg-white border-slate-200 text-slate-900'
}`}>
```

**Depois:**
```javascript
<div className={commonClasses.card}>
```

### Exemplo 3 - Input:
**Antes:**
```javascript
<input className={`w-full px-4 py-2 rounded-xl ${
  isDarkMode 
    ? 'bg-slate-900 text-white border-slate-600' 
    : 'bg-white text-slate-900 border-slate-300'
}`} />
```

**Depois:**
```javascript
<input className={commonClasses.input} />
```

## 🚀 Começando

Execute o projeto e veja o MenuSuperior funcionando com o novo sistema.
O botão de alternância de tema já está operacional!

Próximo componente recomendado: **Home**
