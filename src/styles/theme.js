// Sistema de temas centralizado para melhor manutenção
// Suporta Modo Claro e Escuro

export const lightTheme = {
  bg: {
    primary: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    secondary: 'bg-gradient-to-br from-white to-gray-50',
    tertiary: 'bg-gray-100',
    input: 'bg-white',
    card: 'bg-white',
    hover: 'hover:bg-gray-100',
    menu: 'bg-gradient-to-b from-white via-gray-50 to-gray-100',
    menuHeader: 'bg-gradient-to-r from-gray-100 to-gray-50',
    menuFooter: 'bg-gradient-to-t from-white to-gray-50',
    navbar: 'bg-white',
    button: 'bg-gray-200',
    buttonSecondary: 'bg-gray-300',
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    tertiary: 'text-gray-600',
    muted: 'text-gray-500',
    button: 'text-gray-900',
    link: 'text-gray-800',
  },
  border: {
    primary: 'border-gray-300',
    secondary: 'border-gray-200',
    input: 'border-gray-300',
    card: 'border-gray-200',
  },
  placeholder: {
    input: 'placeholder-gray-400',
  },
  shadow: {
    card: 'shadow-lg',
    button: 'shadow-md',
  },
  icon: {
    primary: 'text-gray-600',
    secondary: 'text-gray-500',
    hover: 'hover:text-gray-900',
  },
  menuItem: {
    base: 'bg-white',
    hover: 'hover:bg-gray-100',
    expanded: 'bg-gray-200',
  },
};

export const darkTheme = {
  bg: {
    primary: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    secondary: 'bg-gradient-to-br from-slate-800/90 to-slate-700/90',
    tertiary: 'bg-slate-800/50',
    input: 'bg-slate-900/50',
    card: 'bg-gradient-to-br from-slate-800/90 to-slate-700/90',
    hover: 'hover:bg-slate-700/50',
    menu: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
    menuHeader: 'bg-gradient-to-r from-slate-800 to-slate-700',
    menuFooter: 'bg-gradient-to-t from-slate-900 to-slate-800/95',
    navbar: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800',
    button: 'bg-slate-700/50',
    buttonSecondary: 'bg-slate-700',
  },
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    tertiary: 'text-slate-400',
    muted: 'text-slate-500',
    button: 'text-white',
    link: 'text-blue-400',
  },
  border: {
    primary: 'border-slate-700/50',
    secondary: 'border-slate-600/50',
    input: 'border-slate-600/50',
    card: 'border-slate-600/50',
  },
  placeholder: {
    input: 'placeholder-slate-500',
  },
  shadow: {
    card: 'shadow-2xl',
    button: 'shadow-lg',
  },
  icon: {
    primary: 'text-slate-400',
    secondary: 'text-slate-500',
    hover: 'hover:text-white',
  },
  menuItem: {
    base: 'bg-gradient-to-br from-slate-800/80 to-slate-700/50',
    hover: 'hover:from-slate-700/90 hover:to-slate-600/60',
    expanded: 'from-blue-600/40 to-blue-700/30',
  },
};

// Tema padrão (será substituído dinamicamente)
export let themeClasses = lightTheme;

// Função helper para combinar classes condicionais
export const getThemeClass = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Classes compostas comuns
export const commonClasses = {
  card: getThemeClass(
    themeClasses.bg.card,
    themeClasses.border.card,
    themeClasses.shadow.card,
    'rounded-2xl p-8 border transition-all duration-300'
  ),
  
  input: getThemeClass(
    themeClasses.bg.input,
    themeClasses.border.input,
    themeClasses.text.primary,
    themeClasses.placeholder.input,
    'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all'
  ),
  
  button: getThemeClass(
    themeClasses.bg.button,
    themeClasses.text.button,
    'px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105',
    themeClasses.hover
  ),

  heading1: getThemeClass(
    themeClasses.text.primary,
    'text-3xl sm:text-4xl font-black mb-2'
  ),

  heading2: getThemeClass(
    themeClasses.text.primary,
    'text-2xl font-bold'
  ),

  paragraph: getThemeClass(
    themeClasses.text.secondary
  ),
};
