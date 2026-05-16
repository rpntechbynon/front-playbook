const AlertaOportunidade = () => {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start justify-between gap-4">
      <div className="flex-1">
        {/* Título */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          <h3 className="text-[11px] font-semibold text-red-600 tracking-wide uppercase">
            Oportunidade de upgrade detectada
          </h3>
        </div>
        
        {/* Descrição */}
        <p className="text-xs text-gray-700 leading-relaxed ml-[14px]">
          Cliente solicitou 2ª via de fatura. Perfil ideal para Débito Automático + Upgrade 5G.
        </p>
      </div>
      
      {/* Valor da Comissão */}
      <div className="text-xs font-semibold text-red-600 whitespace-nowrap">
        +R$ 45,00 comissão
      </div>
    </div>
  );
};

export default AlertaOportunidade;
