import { Check } from 'lucide-react';

const CardCliente = () => {
  const dores = [
    'Esquece vencimento da fatura (atrasos constantes)',
    'Consome toda a franquia de dados no dia 20',
    'Não possui acesso ao streaming no celular'
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      {/* Cabeçalho - Info do Cliente */}
      <div className="flex items-center gap-2.5 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-lg text-gray-400">👤</span>
        </div>
        
        {/* Nome e Perfil */}
        <div>
          <h3 className="text-xs font-semibold text-gray-900 mb-0.5">
            Marcos Oliveira, 34
          </h3>
          <p className="text-[10px] text-gray-500">
            Perfil: Consumidor Heavy-User
          </p>
        </div>
      </div>

      {/* Métricas - Ticket e Fidelidade */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-md p-2">
          <p className="text-[9px] font-semibold text-gray-400 tracking-wider mb-0.5">
            TICKET MÉDIO
          </p>
          <p className="text-sm font-bold text-gray-900">
            R$ 189,90
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-md p-2">
          <p className="text-[9px] font-semibold text-gray-400 tracking-wider mb-0.5">
            FIDELIDADE
          </p>
          <p className="text-sm font-bold text-gray-900">
            24 meses
          </p>
        </div>
      </div>

      {/* Principais Dores */}
      <div>
        <h4 className="text-[9px] font-semibold text-gray-400 tracking-wider mb-2">
          PRINCIPAIS DORES
        </h4>
        <div className="space-y-1">
          {dores.map((dor, index) => (
            <div key={index} className="flex items-start gap-1.5">
              <Check className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-gray-700 leading-relaxed">
                {dor}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardCliente;

