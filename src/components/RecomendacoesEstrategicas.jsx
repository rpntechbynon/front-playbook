const RecomendacoesEstrategicas = () => {
  const recomendacoes = [
    {
      tipo: 'UPGRADE',
      nome: '500 Mega Fibra',
      preco: 'R$ 99,90',
      comissao: '+R$ 12 comissão',
      tagColor: 'bg-red-500'
    },
    {
      tipo: 'CROSS',
      nome: 'Disney+ & Star',
      preco: 'R$ 29,90',
      comissao: '+R$ 8 comissão',
      tagColor: 'bg-blue-500'
    },
    {
      tipo: 'COMBO',
      nome: 'Multi Total 5G',
      preco: 'R$ 149,90',
      comissao: '+R$ 25 comissão',
      tagColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="mt-3">
      <h3 className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase mb-2">
        Recomendações Estratégicas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {recomendacoes.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-2"
          >
            {/* Tag do Tipo */}
            <div className="flex items-center justify-between mb-1.5">
              <span className={`${item.tagColor} text-white text-[8px] font-semibold px-1.5 py-0.5 rounded uppercase`}>
                {item.tipo}
              </span>
              <span className="text-[8px] text-gray-500 font-medium">
                {item.comissao}
              </span>
            </div>

            {/* Nome do Produto */}
            <h4 className="text-xs font-semibold text-gray-900 mb-0.5">
              {item.nome}
            </h4>

            {/* Preço */}
            <p className="text-sm font-bold text-gray-900">
              {item.preco}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecomendacoesEstrategicas;
