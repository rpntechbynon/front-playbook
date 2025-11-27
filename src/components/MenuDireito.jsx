import React, { useState, useEffect } from "react";
import { Link, MapPin, ExternalLink, ChevronRight, Layers, Navigation, ArrowRight, Info } from "lucide-react";
import TrilhaService from "../services/TrilhaService";
import { useTheme } from "../contexts/ThemeContext";

export default function MenuDireito({ selectedTrilha, onSelectDestination, isMinimized, onToggleMinimize }) {
  const { theme, isDarkMode } = useTheme();
  const [destinations, setDestinations] = useState([]);
  const [allTrilhas, setAllTrilhas] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);

  useEffect(() => {
    fetchAllTrilhas();
  }, []);

  useEffect(() => {
    if (selectedTrilha && selectedTrilha.go_to) {
      const goToIds = selectedTrilha.go_to.split(',').map(id => id.trim());
      const destinationTrilhas = findTrilhasByIds(goToIds);
      setDestinations(destinationTrilhas);
    } else {
      setDestinations([]);
    }
    // Limpar seleção quando mudar a trilha principal
    setSelectedDestinationId(null);
  }, [selectedTrilha, allTrilhas]);

  const fetchAllTrilhas = async () => {
    try {
      const data = await TrilhaService.buscarTrilhas();
      const trilhasFormatadas = TrilhaService.transformarParaFormato(data);
      const flattenedTrilhas = flattenTrilhas(trilhasFormatadas);
      setAllTrilhas(flattenedTrilhas);
    } catch (error) {
      console.error("Erro ao carregar trilhas:", error);
    }
  };

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

  const findTrilhasByIds = (ids) => {
    return ids
      .map(id => allTrilhas.find(trilha => trilha.id === parseInt(id)))
      .filter(trilha => trilha !== undefined);
  };

  const handleDestinationClick = (destination) => {
    setSelectedDestinationId(destination.id);
    if (onSelectDestination) {
      onSelectDestination(destination);
    }
  };

  const getColorClasses = (index) => {
    const darkColors = [
      {
        bg: "from-blue-600/20 to-blue-500/10",
        border: "border-blue-500/40",
        icon: "bg-blue-500/30 text-blue-300",
        hover: "hover:from-blue-600/30 hover:to-blue-500/20 hover:border-blue-400/60",
        ring: "hover:ring-2 hover:ring-blue-400/30"
      },
      {
        bg: "from-purple-600/20 to-purple-500/10",
        border: "border-purple-500/40",
        icon: "bg-purple-500/30 text-purple-300",
        hover: "hover:from-purple-600/30 hover:to-purple-500/20 hover:border-purple-400/60",
        ring: "hover:ring-2 hover:ring-purple-400/30"
      },
      {
        bg: "from-pink-600/20 to-pink-500/10",
        border: "border-pink-500/40",
        icon: "bg-pink-500/30 text-pink-300",
        hover: "hover:from-pink-600/30 hover:to-pink-500/20 hover:border-pink-400/60",
        ring: "hover:ring-2 hover:ring-pink-400/30"
      },
      {
        bg: "from-cyan-600/20 to-cyan-500/10",
        border: "border-cyan-500/40",
        icon: "bg-cyan-500/30 text-cyan-300",
        hover: "hover:from-cyan-600/30 hover:to-cyan-500/20 hover:border-cyan-400/60",
        ring: "hover:ring-2 hover:ring-cyan-400/30"
      }
    ];

    const lightColors = [
      {
        bg: "from-gray-100 to-white",
        border: "border-gray-300",
        icon: "bg-gray-700 text-white",
        hover: "hover:from-gray-200 hover:to-gray-50 hover:border-gray-400",
        ring: "hover:ring-2 hover:ring-gray-300"
      },
      {
        bg: "from-gray-50 to-white",
        border: "border-gray-200",
        icon: "bg-gray-600 text-white",
        hover: "hover:from-gray-100 hover:to-white hover:border-gray-300",
        ring: "hover:ring-2 hover:ring-gray-300"
      },
      {
        bg: "from-white to-gray-50",
        border: "border-gray-200",
        icon: "bg-gray-500 text-white",
        hover: "hover:from-gray-50 hover:to-white hover:border-gray-300",
        ring: "hover:ring-2 hover:ring-gray-200"
      },
      {
        bg: "from-white to-gray-50",
        border: "border-gray-200",
        icon: "bg-gray-500 text-white",
        hover: "hover:from-gray-50 hover:to-white hover:border-gray-300",
        ring: "hover:ring-2 hover:ring-gray-200"
      }
    ];

    const colors = isDarkMode ? darkColors : lightColors;
    return colors[index % colors.length];
  };

  // Não renderiza o menu se não houver trilha selecionada
  if (!selectedTrilha) {
    return null;
  }

  return (
    <aside className={`w-full h-[calc(100vh-5rem)] border-l shadow-2xl sticky top-20 overflow-hidden flex flex-col transition-all duration-300 backdrop-blur-xl ${isMinimized ? 'items-center' : ''} ${isDarkMode ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-700/60 shadow-black/50' : 'bg-gradient-to-b from-white via-gray-50 to-white border-gray-200 shadow-gray-300/50'}`}>
      {/* Header do Menu */}
      <div className={`p-4 border-b backdrop-blur-md transition-colors duration-300 relative overflow-hidden w-full ${isDarkMode ? 'bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 border-slate-600/60' : 'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-gray-200'}`}>
        {/* Efeito de fundo animado */}
        <div className={`absolute inset-0 animate-pulse ${isDarkMode ? 'bg-gradient-to-r from-pink-600/5 via-purple-600/10 to-pink-600/5' : 'bg-gradient-to-r from-gray-200/30 via-gray-300/40 to-gray-200/30'}`} />
        
        {isMinimized ? (
          <button
            onClick={onToggleMinimize}
            className="w-full flex justify-center relative z-10 group"
            title="Expandir menu"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 shadow-pink-500/50' : 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-gray-500/50'}`}>
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-6 ${isDarkMode ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 shadow-pink-500/50' : 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-gray-500/50'}`}>
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Informações</h2>
                <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Detalhes da trilha</p>
              </div>
            </div>
            <button
              onClick={onToggleMinimize}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-200 group"
              title="Minimizar menu"
            >
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo do Menu */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {/* Informação da Trilha Selecionada */}
        <div className={`border rounded-xl p-4 shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800/60 to-slate-700/40 border-slate-600/50' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'}`}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Info className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-bold mb-1 ${theme.text.primary}`}>Informações</h3>
              {selectedTrilha.titulo && (
                <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-gray-800'}`}>{selectedTrilha.titulo}</p>
              )}
              <p className={`text-xs leading-relaxed ${theme.text.secondary}`}>{selectedTrilha.descricao}</p>
            </div>
          </div>
        </div>

        {/* Destinos Disponíveis */}
        {destinations.length > 0 ? (
          <>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Opções Disponíveis ({destinations.length})
            </h3>
            {destinations.map((destination, index) => {
              const colorClasses = getColorClasses(index);
              const isSelected = selectedDestinationId === destination.id;

              return (
                <button
                  key={destination.id}
                  onClick={() => handleDestinationClick(destination)}
                  className={`w-full bg-gradient-to-br ${
                    isSelected 
                      ? (isDarkMode ? 'from-green-600/50 to-emerald-600/40 border-green-400/80 shadow-xl shadow-green-500/40 ring-2 ring-green-400/50' : 'from-green-100 to-emerald-50 border-green-500 shadow-lg shadow-green-300/40 ring-2 ring-green-400')
                      : `${colorClasses.bg} border ${colorClasses.border} ${colorClasses.hover} ${colorClasses.ring}`
                  } rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-sm group cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone */}
                    <div className={`flex-shrink-0 ${colorClasses.icon} rounded-lg p-2.5 transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                      <Navigation className="w-5 h-5" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>ID: {destination.id}</span>
                      </div>
                      {destination.titulo ? (
                        <>
                          <p className={`text-sm font-bold leading-tight mb-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-100 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'}`}>
                            {destination.titulo}
                          </p>
                          <p className={`text-xs leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
                            {destination.descricao}
                          </p>
                        </>
                      ) : (
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {destination.descricao}
                        </p>
                      )}
                    </div>

                    {/* Ícone de seta */}
                    <div className="flex-shrink-0">
                      <ChevronRight className={`w-5 h-5 transition-all duration-300 ${isDarkMode ? 'text-slate-500 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-900'} group-hover:translate-x-1`} />
                    </div>
                  </div>

                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </button>
              );
            })}
          </>
        ) : (
          <div className="text-center p-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/30' : 'bg-gradient-to-br from-gray-200 to-gray-100'}`}>
              <MapPin className={`w-8 h-8 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <p className={`font-semibold mb-2 text-sm ${theme.text.secondary}`}>Nenhuma opção disponível</p>
            <p className={`text-xs ${theme.text.tertiary}`}>Esta trilha não possui opções adicionais</p>
          </div>
        )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #ec4899 100%);
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #db2777 0%, #7c3aed 50%, #db2777 100%);
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.8);
        }
      `}</style>
    </aside>
  );
}
