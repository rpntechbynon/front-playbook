const GanchoAbertura = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      {/* Título */}
      <h4 className="text-[9px] font-semibold text-red-500 tracking-wider mb-2 uppercase">
        Gancho de abertura
      </h4>
      
      {/* Quote */}
      <div className="border-l-2 border-red-300 pl-3 py-1">
        <p className="text-[11px] text-gray-600 italic leading-relaxed">
          "Sr. Marcos, já que estamos gerando sua fatura, notei que o senhor pagou juros por atraso nos últimos 3 meses. Sabia que posso eliminar esse risco hoje?"
        </p>
      </div>
    </div>
  );
};

export default GanchoAbertura;
