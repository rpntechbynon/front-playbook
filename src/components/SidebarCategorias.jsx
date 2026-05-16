import { CreditCard, Phone, Wifi, Tv, X } from 'lucide-react';

const SidebarCategorias = ({ onClose }) => {
  const categorias = [
    { 
      nome: 'Faturas & Boletos', 
      quantidade: 12, 
      icon: CreditCard
    },
    { 
      nome: 'Planos Móveis', 
      quantidade: 18, 
      icon: Phone
    },
    { 
      nome: 'Banda Larga', 
      quantidade: 14, 
      icon: Wifi
    },
    { 
      nome: 'Streaming / TV', 
      quantidade: 9, 
      icon: Tv
    },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-100 p-6 space-y-8 overflow-y-auto relative">
      {/* Botão Fechar - Visível apenas em mobile */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Fechar menu"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      {/* Categorias */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-4">
          CATEGORIAS
        </h3>
        <div className="space-y-2">
          {categorias.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between py-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {cat.nome}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {cat.quantidade}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sua Meta */}
      <div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-3">
            SUA META
            </h3>
            <div className="space-y-2.5">
            {/* Números */}
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">14</span>
                <span className="text-base text-gray-400">/20</span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: '70%' }}
                />
            </div>

            {/* Texto de Comissão */}
          
            <p className="text-xs text-gray-500 leading-relaxed">
              Faltam <span className="font-semibold text-gray-700">6 vendas</span>. 
              R$ <span className="font-semibold text-gray-700">320</span> em comissão pendente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarCategorias;
