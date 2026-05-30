import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MapPin, ExternalLink, ChevronRight, Layers, Navigation, Info, Package, CheckSquare, Image, FileText, X } from "lucide-react";
import TrilhaService from "../services/TrilhaService";

export default function MenuDireito({ selectedTrilha, onSelectDestination, isMinimized, onToggleMinimize, onSelectSubmenuImages }) {
  const [allTrilhas, setAllTrilhas] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [tooltipProdutoId, setTooltipProdutoId] = useState(null);
  const hasFetchedRef = useRef(false);

  // Função para transformar URLs em links clicáveis
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    
    // Regex para detectar URLs (http, https, www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      // Se é uma URL, transforma em link
      if (part.match(urlRegex)) {
        const url = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      // Texto normal - processar quebras de linha
      return part.split('\n').map((line, lineIndex, lines) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  // Função para renderizar texto com tópicos (separados por ;)
  const renderTextWithTopics = (text) => {
    if (!text) return null;
    
    // Se tem ponto e vírgula, divide em tópicos
    if (text.includes(';')) {
      const topics = text.split(';').map(t => t.trim()).filter(t => t.length > 0);
      
      if (topics.length > 1) {
        return (
          <div className="space-y-1">
            {topics.map((topic, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-0.5 w-1 h-1 rounded-full flex-shrink-0 bg-gray-400" />
                <span className="flex-1 text-xs leading-tight">{renderTextWithLinks(topic)}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    // Se não tem ; ou tem apenas um item, retorna texto normal com links e quebras de linha
    return <span>{renderTextWithLinks(text)}</span>;
  };

  const fetchAllTrilhas = useCallback(async () => {
    const flattenTrilhas = (trilhas) => {
      let flattened = [];
      trilhas.forEach(trilha => {
        flattened.push(trilha);
        if (trilha.all_children && trilha.all_children.length > 0) {
          flattened = flattened.concat(flattenTrilhas(trilha.all_children));
        }
      });
      return flattened;
    };

    try {
      const data = await TrilhaService.buscarTrilhas();
      const trilhasFormatadas = TrilhaService.transformarParaFormato(data);
      const flattenedTrilhas = flattenTrilhas(trilhasFormatadas);
      setAllTrilhas(flattenedTrilhas);
    } catch (error) {
      console.error("Erro ao carregar trilhas:", error);
    }
  }, []);

  const findTrilhasByIds = useCallback((ids) => {
    return ids
      .map(id => allTrilhas.find(trilha => trilha.id === parseInt(id)))
      .filter(trilha => trilha !== undefined);
  }, [allTrilhas]);

  // Calcular destinations usando useMemo ao invés de useEffect
  const destinations = useMemo(() => {
    if (selectedTrilha && selectedTrilha.go_to) {
      const goToIds = selectedTrilha.go_to.split(',').map(id => id.trim());
      return findTrilhasByIds(goToIds);
    }
    return [];
  }, [selectedTrilha, findTrilhasByIds]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAllTrilhas();
    }
  }, [fetchAllTrilhas]);

  // Limpar seleção quando mudar a trilha principal
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedDestinationId(null);
  }, [selectedTrilha]);

  const handleDestinationClick = (destination) => {
    setSelectedDestinationId(destination.id);
    if (onSelectDestination) {
      onSelectDestination(destination);
    }
  };

  // Simplificado - sem gradientes
  const getCardClasses = () => {
    return {
      bg: "bg-white",
      border: "border-gray-200",
      icon: "bg-gray-100",
      iconColor: "text-gray-600",
      hover: "hover:shadow-md hover:border-gray-300"
    };
  };

  // Não renderiza o menu se não houver trilha selecionada
  if (!selectedTrilha) {
    return null;
  }

  return (
    <aside className={`w-full h-[calc(100vh-3.5rem)] border-l border-gray-200 bg-white sticky top-14 overflow-visible flex flex-col shadow-sm ${isMinimized ? 'items-center' : ''}`}>
      {/* Header do Menu */}
      <div className="p-4 border-b border-gray-200 bg-white">
        {isMinimized ? (
          <button
            onClick={onToggleMinimize}
            className="w-full flex justify-center group"
            title="Expandir menu"
          >
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-red-600 transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-sm">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informações</h2>
              </div>
            </div>
            <button
              onClick={onToggleMinimize}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="Minimizar menu"
            >
              <ChevronRight className="w-4 h-4 text-gray-500 rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo do Menu */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Informação da Trilha Selecionada */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-blue-100">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold mb-1 text-gray-800">Informações</h3>
              {selectedTrilha.titulo && (
                <p className="text-xs font-semibold mb-1.5 text-gray-700">{selectedTrilha.titulo}</p>
              )}
              <div className="text-xs leading-relaxed text-gray-600">
                {renderTextWithTopics(selectedTrilha.descricao)}
              </div>
            </div>
          </div>
        </div>

        {/* Submenus */}
        {selectedTrilha.submenus && selectedTrilha.submenus.length > 0 && (
          <>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">
              Submenus ({selectedTrilha.submenus.length})
            </h3>
            {selectedTrilha.submenus.map((submenu) => {
              const cardClasses = getCardClasses();
              
              // Verificar se o submenu tem imagens
              const imagensSubmenu = submenu.documentos?.filter(doc => 
                doc.tipo?.startsWith('image/') || doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              ) || [];
              const hasImages = imagensSubmenu.length > 0;
              
              // Função para clicar no card e exibir as imagens
              const handleSubmenuClick = () => {
                if (hasImages && onSelectSubmenuImages) {
                  onSelectSubmenuImages(imagensSubmenu, 0);
                }
              };
              
              return (
                <div
                  key={submenu.id}
                  onClick={handleSubmenuClick}
                  className={`${cardClasses.bg} border ${cardClasses.border} rounded-lg p-3 shadow-sm transition-all ${cardClasses.hover} ${hasImages ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {/* Ícone */}
                    <div className={`flex-shrink-0 ${cardClasses.icon} rounded-md p-1.5`}>
                      <Layers className={`w-4 h-4 ${cardClasses.iconColor}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-gray-500">Ordem: {submenu.ordem}</span>
                        {hasImages && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-100 text-blue-700">
                            <Image className="w-2.5 h-2.5" />
                            {imagensSubmenu.length}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold leading-tight mb-1 text-gray-800">
                        {submenu.titulo}
                      </p>
                      <div className="text-[11px] leading-relaxed text-gray-600">
                        {renderTextWithTopics(submenu.descricao)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Produtos */}
        {selectedTrilha.produtos && selectedTrilha.produtos.length > 0 && (
          <>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1 mt-4">
              Produtos ({selectedTrilha.produtos.length})
            </h3>
            {selectedTrilha.produtos
              .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
              .map((produto) => {
              const cardClasses = getCardClasses();
              
              return (
                <div
                  key={produto.id}
                  className={`${cardClasses.bg} border ${cardClasses.border} rounded-lg p-3 shadow-sm transition-all ${cardClasses.hover}`}
                >
                  <div className="flex items-start gap-2">
                    {/* Ícone */}
                    <div className={`flex-shrink-0 ${cardClasses.icon} rounded-md p-1.5`}>
                      <Package className={`w-4 h-4 ${cardClasses.iconColor}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-gray-500">Ordem: {produto.ordem || '?'}</span>
                        {produto.recomendado == 1 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-yellow-100 text-yellow-700">
                            <CheckSquare className="w-2.5 h-2.5" />
                            <span>Recomendado</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold leading-tight text-gray-800">
                          {produto.nome || 'Produto sem nome'}
                        </p>
                        {/* Ícone de informação com tooltip */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTooltipProdutoId(tooltipProdutoId === produto.id ? null : produto.id);
                          }}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Tooltip dos Produtos - Renderizado fora do container com scroll */}
        {tooltipProdutoId && selectedTrilha.produtos && (
          <>
            {/* Overlay para fechar ao clicar fora */}
            <div 
              className="fixed inset-0 z-[99998] bg-black/20"
              onClick={() => setTooltipProdutoId(null)}
            />
            {/* Tooltip */}
            {selectedTrilha.produtos
              .filter(p => p.id === tooltipProdutoId)
              .map(produto => (
                <div 
                  key={produto.id}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-4 rounded-lg shadow-lg z-[99999] bg-white border-2 border-gray-200"
                >
                  {/* Botão fechar */}
                  <button
                    onClick={() => setTooltipProdutoId(null)}
                    className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-2 text-xs mt-2">
                    <h3 className="font-bold text-sm text-gray-900">
                      Informações do Produto
                    </h3>
                    <div className="space-y-1.5">
                      <div>
                        <span className="font-semibold text-gray-700">Nome: </span>
                        <span className="text-gray-600">{produto.nome || 'N/A'}</span>
                      </div>
                      {produto.descricao && (
                        <div>
                          <span className="font-semibold text-gray-700">Descrição: </span>
                          <div className="inline text-gray-600">
                            {renderTextWithTopics(produto.descricao)}
                          </div>
                        </div>
                      )}
                      {produto.tipo && (
                        <div>
                          <span className="font-semibold text-gray-700">Tipo: </span>
                          <span className="text-gray-600">{produto.tipo}</span>
                        </div>
                      )}
                      {produto.preco && (
                        <div>
                          <span className="font-semibold text-gray-700">Preço: </span>
                          <span className="text-gray-600">{produto.preco}</span>
                        </div>
                      )}
                      {produto.link && (
                        <div>
                          <span className="font-semibold text-gray-700">Link: </span>
                          <a href={produto.link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-700">
                            Ver produto
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-700">Recomendado: </span>
                        <span className="text-gray-600">{produto.recomendado == 1 ? 'Sim' : 'Não'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Ordem: </span>
                        <span className="text-gray-600">{produto.ordem}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}

        {/* Destinos Disponíveis */}
        {destinations.length > 0 ? (
          <>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">
              Opções Disponíveis ({destinations.length})
            </h3>
            {destinations.map((destination) => {
              const cardClasses = getCardClasses();
              const isSelected = selectedDestinationId === destination.id;

              return (
                <button
                  key={destination.id}
                  onClick={() => handleDestinationClick(destination)}
                  className={`w-full ${isSelected ? 'bg-green-50 border-green-500 shadow-md' : `${cardClasses.bg} border ${cardClasses.border}`} rounded-lg p-3 shadow-sm transition-all ${cardClasses.hover} cursor-pointer text-left`}
                >
                  <div className="flex items-start gap-2">
                    {/* Ícone */}
                    <div className={`flex-shrink-0 ${isSelected ? 'bg-green-100' : cardClasses.icon} rounded-md p-1.5`}>
                      <Navigation className={`w-4 h-4 ${isSelected ? 'text-green-600' : cardClasses.iconColor}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-gray-500">ID: {destination.id}</span>
                      </div>
                      {destination.titulo ? (
                        <>
                          <p className={`text-xs font-semibold leading-tight mb-1 ${isSelected ? 'text-green-900' : 'text-gray-800'}`}>
                            {destination.titulo}
                          </p>
                          <div className="text-[11px] leading-relaxed text-gray-600">
                            {renderTextWithTopics(destination.descricao)}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs leading-relaxed text-gray-700">
                          {renderTextWithTopics(destination.descricao)}
                        </div>
                      )}
                    </div>

                    {/* Ícone de seta */}
                    <div className="flex-shrink-0">
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        ) : (
          <div className="text-center p-8">
            <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-gray-300" />
            </div>
            <p className="font-medium mb-1 text-xs text-gray-600">Nenhuma opção disponível</p>
            <p className="text-[10px] text-gray-400">Esta trilha não possui opções adicionais</p>
          </div>
        )}
        </div>
      )}
    </aside>
  );
}
