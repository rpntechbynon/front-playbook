import { Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const BarraPlayBook = ({ onMenuClick }) => {
  return (
    <div className="flex items-center justify-between px-3 md:px-6 py-2.5 bg-white border-b border-gray-100">
      {/* Botão Menu - Visível apenas em mobile */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Logo e Título */}
      <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
        <div className="w-8 h-8 bg-red-500 rounded-full" />
        <span className="text-xs md:text-sm font-medium text-gray-700">
          PLAYBOOK 
        </span>
      </Link>

      {/* Campo de Busca - Escondido em mobile */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar script, objeção ou produto..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-300 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Info de Vendas e Avatar */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Vendas Hoje */}
        <div className="flex items-center gap-1 md:gap-2">
          <div className="flex items-baseline gap-0.5 md:gap-1">
            <span className="text-sm md:text-base font-semibold text-gray-900">14</span>
            <span className="text-xs md:text-sm text-gray-400">/20</span>
          </div>
          <div className="w-12 md:w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full"
              style={{ width: '70%' }}
            />
          </div>
        </div>

        {/* Avatar do Usuário */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-7 md:w-8 h-7 md:h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">R</span>
          </div>
          <span className="hidden sm:block text-sm text-gray-700">Rafael</span>
        </div>
      </div>
    </div>
  );
};

export default BarraPlayBook;
