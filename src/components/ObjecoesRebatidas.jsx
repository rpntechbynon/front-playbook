import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ObjecoesRebatidas = () => {
  const [expandido, setExpandido] = useState(0);

  const objecoes = [
    {
      titulo: '"Está caro / Não quero pagar mais"',
      resposta: 'Reforce o ganho líquido: "O senhor para de pagar juros (R$ 18/mês) E ganha 50GB extras. No bolso, é economia real de R$ 18 e mais internet de bônus."'
    },
    {
      titulo: '"Vou pensar / Falo depois"',
      resposta: 'Crie urgência: "Entendo perfeitamente. Só que essa condição de 50GB extras sem custo é válida apenas para ativações hoje. Vou deixar separado no seu nome, mas preciso confirmar agora para garantir. Podemos fazer?"'
    },
    {
      titulo: '"Não confio em débito automático"',
      resposta: 'Mostre controle: "Compreendo a preocupação. O débito só acontece no vencimento da fatura, e o senhor recebe o aviso antes por SMS e email. Se precisar cancelar, é só ligar. Mas garante que nunca mais paga juros e ainda ganha internet extra. Vale a pena testar?"'
    }
  ];

  const toggleItem = (index) => {
    setExpandido(expandido === index ? null : index);
  };

  return (
    <div className="mt-3">
      <h3 className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase mb-2">
        Objeções & Rebatidas
      </h3>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {objecoes.map((obj, index) => (
          <div
            key={index}
            className="bg-white"
          >
            {/* Cabeçalho Clicável */}
            <button
              onClick={() => toggleItem(index)}
              className={`w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 transition-colors ${
                index !== 0 ? 'border-t border-gray-200' : ''
              }`}
            >
              <span className="text-xs font-medium text-gray-900">
                {obj.titulo}
              </span>
              {expandido === index ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {/* Conteúdo Expandido */}
            {expandido === index && (
              <div className="px-2 pb-2 pt-1 border-t border-gray-100">
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {obj.resposta}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObjecoesRebatidas;
