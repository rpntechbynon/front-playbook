import { Copy } from 'lucide-react';

const ScriptPitch = () => {
  return (
    <div className="bg-gray-900 text-white rounded-lg p-3">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase">
          Script de Pitch
        </h3>
        <button className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-[9px] font-medium transition-colors">
          <Copy className="w-2.5 h-2.5" />
          Copiar Script
        </button>
      </div>

      {/* Conteúdo do Script */}
      <div className="text-xs leading-relaxed">
        <p>
          "Para facilitar, vamos colocar sua conta no <span className="font-semibold">Débito Automático</span>. Com isso, eu consigo te liberar um bônus de <span className="font-semibold">50GB extras</span> sem custo adicional no seu plano atual. O senhor economiza os juros e dobra sua internet hoje."
        </p>
      </div>
    </div>
  );
};

export default ScriptPitch;
