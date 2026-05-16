import { ArrowRight } from 'lucide-react';

const ScriptFechamento = () => {
  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* Script */}
      <div className="flex-1">
        <h3 className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase mb-1.5">
          Script de Fechamento
        </h3>
        <p className="text-xs text-gray-700 italic leading-relaxed">
          "Perfeito! Vou atualizar seu cadastro aqui. O bônus cai em 2h e sua fatura já está programada. Posso prosseguir?"
        </p>
      </div>

      {/* Botão */}
      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors w-full md:w-auto justify-center">
        FINALIZAR VENDA
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ScriptFechamento;
