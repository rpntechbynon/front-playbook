import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserPlus, TrendingUp, Sun, Moon, AppWindow } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function MenuSuperior() {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const location = useLocation();
  
  const backToSolutions = () => {
    // Remove dados da sessão atual do CRM
    sessionStorage.removeItem('usuario');
    
    // Redireciona para o painel principal (Solutions)
    // Nota: O painel Solutions deverá ter sua própria autenticação
    window.location.href = '/inicio';
  };
  
  return (
    <nav className={`w-full ${theme.bg.navbar} shadow-lg fixed top-0 left-0 z-50 border-b ${theme.border.card} transition-colors duration-300`}>
      <div className="max-w-full px-4 flex items-center justify-between h-20">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'} rounded-lg flex items-center justify-center shadow-md`}>
            <span className="text-white font-black text-xl">P</span>
          </div>
          <span className={`font-black text-2xl ${theme.text.primary} tracking-tight`}>PlayBook</span>
          
          <button
            onClick={backToSolutions}
            className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              location.pathname === '/inicio' 
                ? `${isDarkMode ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50' : 'bg-teal-50 text-teal-600 border border-teal-300'}`
                : `${theme.text.secondary} ${isDarkMode ? 'hover:bg-white/10 hover:text-teal-400' : 'hover:bg-gray-100 hover:text-teal-600'}`
            }`}
            title="Voltar para Solutions"
          >
            <AppWindow className="w-4 h-4" />
            <span className="text-xs">Solutions</span>
          </button>
        </div>
        <ul className="flex gap-3 items-center">
          <li>
            <Link to="/cadastro" className={`group relative px-6 py-2.5 rounded-xl ${theme.text.primary} font-semibold ${theme.bg.button} ${isDarkMode ? 'hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500' : 'hover:bg-gray-800 hover:text-white'} transition-all duration-300 shadow-md hover:scale-105 flex items-center gap-2`}>
              <UserPlus className="w-5 h-5" />
              Cadastro
            </Link>
          </li>
          <li>
            <Link to="/trilha" className={`group relative px-6 py-2.5 rounded-xl ${theme.text.primary} font-semibold ${theme.bg.button} ${isDarkMode ? 'hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-500' : 'hover:bg-gray-700 hover:text-white'} transition-all duration-300 shadow-md hover:scale-105 flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5" />
              Trilha de Vendas
            </Link>
          </li>
          <li>
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl ${theme.bg.button} ${theme.text.primary} hover:scale-110 transition-all duration-300 shadow-md ${theme.icon.hover}`}
              title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
