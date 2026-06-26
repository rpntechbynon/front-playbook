import { Link, useLocation } from "react-router-dom";
import { Search, Home, UserPlus, TrendingUp, Package, Sparkles, ClipboardList, ArrowLeft } from "lucide-react";

const SOLUTIONS_URL = "https://solutions.cellular.com.br/inicio";

export default function MenuSuperior() {
  const location = useLocation();

  const menuItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/cadastro", label: "Cadastro", icon: UserPlus },
    { path: "/produtos", label: "Produtos", icon: Package },
    { path: "/formularios", label: "Formulários", icon: ClipboardList },
    { path: "/trilha", label: "Trilha de Vendas", icon: TrendingUp },
    { path: "/tela", label: "PlayBook", icon: Sparkles },
  ];
  
  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50 border-b border-gray-200">
      <div className="max-w-full px-3 md:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-sm text-gray-900 tracking-tight uppercase">
            PlayBook <span className="text-gray-400 text-xs ml-1">v.2.0</span>
          </span>
        </Link>

        {/* Campo de Busca - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar script, objeção ou produto..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300 focus:bg-white placeholder:text-gray-400 transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-500 bg-white border border-gray-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
        
        {/* Menu Items + Voltar ao Solutions */}
        <div className="flex items-center gap-2">
          {/* Menu Items - Desktop */}
          <ul className="hidden lg:flex gap-1 items-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                      isActive
                        ? 'bg-red-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Voltar ao Solutions */}
          <a
            href={SOLUTIONS_URL}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Voltar para o Solutions"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Solutions</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
