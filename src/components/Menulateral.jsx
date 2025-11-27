import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { ChevronDown, ChevronRight, HelpCircle, BookOpen, List, Search, X } from "lucide-react";
import TrilhaService from "../services/TrilhaService";
import { useTheme } from "../contexts/ThemeContext";

const MenuLateral = forwardRef(({ onSelectTrilha }, ref) => {
  const { theme, isDarkMode } = useTheme();
  const [expandedItems, setExpandedItems] = useState({});
  const [decisoes, setDecisoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDecisoes, setFilteredDecisoes] = useState([]);
  const [selectedTrilhaId, setSelectedTrilhaId] = useState(null);

  useEffect(() => {
    fetchDecisoes();
  }, []);

  // Expor método para selecionar trilha externamente
  useImperativeHandle(ref, () => ({
    selectTrilha: (trilhaId) => {
      setSelectedTrilhaId(trilhaId);
      expandParentsOfTrilha(trilhaId);
      // Scroll para o elemento após um pequeno delay para garantir que foi expandido
      setTimeout(() => {
        const element = document.getElementById(`trilha-item-${trilhaId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }));

  const expandParentsOfTrilha = (trilhaId) => {
    const findAndExpandParents = (items, targetId, parents = []) => {
      for (const item of items) {
        if (item.id === targetId) {
          // Encontrou, expande todos os pais
          const newExpanded = { ...expandedItems };
          parents.forEach(parentId => {
            newExpanded[parentId] = true;
          });
          setExpandedItems(newExpanded);
          return true;
        }
        if (item.all_children && item.all_children.length > 0) {
          if (findAndExpandParents(item.all_children, targetId, [...parents, item.id])) {
            return true;
          }
        }
      }
      return false;
    };
    findAndExpandParents(decisoes, trilhaId);
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDecisoes(decisoes);
    } else {
      const filtered = filterDecisoes(decisoes, searchTerm.toLowerCase());
      setFilteredDecisoes(filtered);
      // Auto-expandir itens que contêm o termo de busca
      if (filtered.length > 0) {
        const idsToExpand = {};
        filtered.forEach(item => expandAllParents(item, idsToExpand));
        setExpandedItems(idsToExpand);
      }
    }
  }, [searchTerm, decisoes]);

  const filterDecisoes = (items, term) => {
    return items.reduce((acc, item) => {
      const matchesSearch = item.descricao.toLowerCase().includes(term) || 
                           (item.titulo && item.titulo.toLowerCase().includes(term));
      const filteredChildren = item.all_children ? filterDecisoes(item.all_children, term) : [];
      
      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...item,
          all_children: filteredChildren,
          highlighted: matchesSearch
        });
      }
      
      return acc;
    }, []);
  };

  const expandAllParents = (item, idsObj) => {
    idsObj[item.id] = true;
    if (item.all_children && item.all_children.length > 0) {
      item.all_children.forEach(child => expandAllParents(child, idsObj));
    }
  };

  const fetchDecisoes = async () => {
    try {
      const data = await TrilhaService.buscarTrilhas();
      setDecisoes(data);
      setFilteredDecisoes(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar decisões:", error);
      setLoading(false);
    }
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const hasChildren = (item) => {
    return item.all_children && item.all_children.length > 0;
  };

  const handleItemClick = (item, hasChildrenItems) => {
    // Sempre seleciona a trilha para mostrar seus anexos
    setSelectedTrilhaId(item.id);
    if (onSelectTrilha) {
      onSelectTrilha(item);
    }
    
    // Se tem filhos, também expande/colapsa
    if (hasChildrenItems) {
      toggleExpand(item.id);
    }
  };

  const highlightText = (text, term) => {
    if (!term.trim()) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === term.toLowerCase() ? 
        <mark key={index} className="bg-yellow-400/40 text-yellow-100 px-1.5 py-0.5 rounded font-semibold">{part}</mark> : 
        part
    );
  };

  const getItemColors = (level, isExpanded, hasChildrenItems) => {
    const darkColors = [
      {
        default: 'from-slate-800/95 to-slate-700/80 border-slate-600/70 border-l-4 border-l-blue-500/70',
        expanded: 'from-blue-600/50 to-purple-600/40 border-blue-400/70 border-l-4 border-l-blue-400',
        hover: 'hover:from-slate-700 hover:to-slate-600/80 hover:border-slate-500'
      },
      {
        default: 'from-slate-700/85 to-slate-600/70 border-slate-500/60 border-l-4 border-l-purple-500/70',
        expanded: 'from-purple-600/45 to-indigo-600/35 border-purple-400/60 border-l-4 border-l-purple-400',
        hover: 'hover:from-slate-600/90 hover:to-slate-500/70 hover:border-slate-400'
      },
      {
        default: 'from-slate-600/75 to-slate-500/60 border-slate-400/50 border-l-4 border-l-indigo-500/70',
        expanded: 'from-indigo-600/40 to-cyan-600/30 border-indigo-400/50 border-l-4 border-l-indigo-400',
        hover: 'hover:from-slate-500/80 hover:to-slate-400/60 hover:border-slate-300'
      },
      {
        default: 'from-slate-500/65 to-slate-400/50 border-slate-300/40 border-l-4 border-l-cyan-500/70',
        expanded: 'from-cyan-600/35 to-teal-600/25 border-cyan-400/40 border-l-4 border-l-cyan-400',
        hover: 'hover:from-slate-400/70 hover:to-slate-300/50 hover:border-slate-200'
      }
    ];

    const lightColors = [
      {
        default: 'from-gray-100 to-white border-gray-300 border-l-4 border-l-gray-600',
        expanded: 'from-gray-200 to-gray-50 border-gray-400 border-l-4 border-l-gray-700',
        hover: 'hover:from-gray-200 hover:to-gray-100 hover:border-gray-400'
      },
      {
        default: 'from-gray-50 to-white border-gray-200 border-l-4 border-l-gray-500',
        expanded: 'from-gray-100 to-white border-gray-300 border-l-4 border-l-gray-600',
        hover: 'hover:from-gray-100 hover:to-gray-50 hover:border-gray-300'
      },
      {
        default: 'from-white to-gray-50 border-gray-200 border-l-4 border-l-gray-400',
        expanded: 'from-gray-100 to-gray-50 border-gray-300 border-l-4 border-l-gray-500',
        hover: 'hover:from-gray-50 hover:to-white hover:border-gray-300'
      },
      {
        default: 'from-white to-gray-50 border-gray-100 border-l-4 border-l-gray-400',
        expanded: 'from-gray-50 to-white border-gray-200 border-l-4 border-l-gray-500',
        hover: 'hover:from-gray-50 hover:to-white hover:border-gray-200'
      }
    ];

    const colors = isDarkMode ? darkColors : lightColors;
    const colorSet = colors[Math.min(level, 3)];
    
    if (isExpanded && hasChildrenItems) {
      return `${colorSet.expanded} ${colorSet.hover}`;
    }
    
    return `${colorSet.default} ${colorSet.hover}`;
  };

  const getIconColors = (level, isExpanded) => {
    const darkIconColors = [
      { expanded: 'bg-gradient-to-br from-blue-500/40 to-purple-500/30 text-blue-300 shadow-lg shadow-blue-500/30', collapsed: 'bg-slate-600/30 group-hover:bg-gradient-to-br group-hover:from-blue-500/40 group-hover:to-purple-500/30 text-slate-400 group-hover:text-blue-300 group-hover:shadow-md group-hover:shadow-blue-500/20' },
      { expanded: 'bg-gradient-to-br from-purple-500/40 to-indigo-500/30 text-purple-300 shadow-lg shadow-purple-500/30', collapsed: 'bg-slate-600/30 group-hover:bg-gradient-to-br group-hover:from-purple-500/40 group-hover:to-indigo-500/30 text-slate-400 group-hover:text-purple-300 group-hover:shadow-md group-hover:shadow-purple-500/20' },
      { expanded: 'bg-gradient-to-br from-indigo-500/40 to-cyan-500/30 text-indigo-300 shadow-lg shadow-indigo-500/30', collapsed: 'bg-slate-600/30 group-hover:bg-gradient-to-br group-hover:from-indigo-500/40 group-hover:to-cyan-500/30 text-slate-400 group-hover:text-indigo-300 group-hover:shadow-md group-hover:shadow-indigo-500/20' },
      { expanded: 'bg-gradient-to-br from-cyan-500/40 to-teal-500/30 text-cyan-300 shadow-lg shadow-cyan-500/30', collapsed: 'bg-slate-600/30 group-hover:bg-gradient-to-br group-hover:from-cyan-500/40 group-hover:to-teal-500/30 text-slate-400 group-hover:text-cyan-300 group-hover:shadow-md group-hover:shadow-cyan-500/20' }
    ];

    const lightIconColors = [
      { expanded: 'bg-gray-700 text-white shadow-md', collapsed: 'bg-gray-200 group-hover:bg-gray-700 text-gray-600 group-hover:text-white group-hover:shadow-sm' },
      { expanded: 'bg-gray-600 text-white shadow-md', collapsed: 'bg-gray-200 group-hover:bg-gray-600 text-gray-500 group-hover:text-white group-hover:shadow-sm' },
      { expanded: 'bg-gray-500 text-white shadow-md', collapsed: 'bg-gray-100 group-hover:bg-gray-500 text-gray-500 group-hover:text-white group-hover:shadow-sm' },
      { expanded: 'bg-gray-500 text-white shadow-md', collapsed: 'bg-gray-100 group-hover:bg-gray-500 text-gray-400 group-hover:text-white group-hover:shadow-sm' }
    ];

    const iconColors = isDarkMode ? darkIconColors : lightIconColors;
    const colorSet = iconColors[Math.min(level, 3)];
    return isExpanded ? colorSet.expanded : colorSet.collapsed;
  };

  const getBadgeColors = (level) => {
    const darkBadgeColors = [
      'bg-gradient-to-br from-blue-500/40 to-purple-500/30 text-white font-extrabold border-blue-300/40 shadow-md shadow-blue-500/30',
      'bg-gradient-to-br from-purple-500/40 to-indigo-500/30 text-white font-extrabold border-purple-300/40 shadow-md shadow-purple-500/30',
      'bg-gradient-to-br from-indigo-500/40 to-cyan-500/30 text-white font-extrabold border-indigo-300/40 shadow-md shadow-indigo-500/30',
      'bg-gradient-to-br from-cyan-500/40 to-teal-500/30 text-white font-extrabold border-cyan-300/40 shadow-md shadow-cyan-500/30'
    ];

    const lightBadgeColors = [
      'bg-gray-700 text-white font-extrabold border-gray-600 shadow-sm',
      'bg-gray-600 text-white font-extrabold border-gray-500 shadow-sm',
      'bg-gray-500 text-white font-extrabold border-gray-400 shadow-sm',
      'bg-gray-500 text-white font-extrabold border-gray-400 shadow-sm'
    ];

    const badgeColors = isDarkMode ? darkBadgeColors : lightBadgeColors;
    return badgeColors[Math.min(level, 3)];
  };

  const getIndicatorColor = (level) => {
    const darkIndicators = [
      'from-blue-400 via-purple-400 to-blue-500 shadow-lg shadow-blue-500/50',
      'from-purple-400 via-indigo-400 to-purple-500 shadow-lg shadow-purple-500/50',
      'from-indigo-400 via-cyan-400 to-indigo-500 shadow-lg shadow-indigo-500/50',
      'from-cyan-400 via-teal-400 to-cyan-500 shadow-lg shadow-cyan-500/50'
    ];

    const lightIndicators = [
      'from-gray-600 via-gray-700 to-gray-800 shadow-md shadow-gray-500/30',
      'from-gray-500 via-gray-600 to-gray-700 shadow-md shadow-gray-400/30',
      'from-gray-400 via-gray-500 to-gray-600 shadow-md shadow-gray-400/30',
      'from-gray-400 via-gray-500 to-gray-600 shadow-md shadow-gray-400/30'
    ];

    const indicators = isDarkMode ? darkIndicators : lightIndicators;
    return indicators[Math.min(level, 3)];
  };

  const renderItem = (item, level = 0, isLastChild = false, parentPath = []) => {
    const isExpanded = expandedItems[item.id];
    const children = item.all_children || [];
    const hasChildrenItems = children.length > 0;
    const isSelected = selectedTrilhaId === item.id;

    return (
      <div key={item.id} className="relative" id={`trilha-item-${item.id}`}>
        {/* Linha conectora vertical para níveis > 0 */}
        {level > 0 && (
          <div 
            className={`absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b to-transparent ${isDarkMode ? 'from-slate-600/40 via-slate-500/30' : 'from-gray-300/60 via-gray-200/40'}`}
            style={{ marginLeft: `${(level - 1) * 24 + 12}px` }}
          />
        )}
        
        {/* Linha conectora horizontal */}
        {level > 0 && (
          <div 
            className={`absolute top-6 left-0 h-px bg-gradient-to-r to-transparent ${isDarkMode ? 'from-slate-600/40' : 'from-gray-300/60'}`}
            style={{ 
              marginLeft: `${(level - 1) * 24 + 12}px`,
              width: '20px'
            }}
          />
        )}

        {/* Item */}
        <div
          className={`relative bg-gradient-to-br ${
            isSelected ? 
            (isDarkMode ? 'from-green-600/50 to-emerald-600/40 border-green-400/80 shadow-xl shadow-green-500/40 ring-2 ring-green-400/50' : 'from-green-100 to-emerald-50 border-green-500 shadow-lg shadow-green-300/40 ring-2 ring-green-400') :
            item.highlighted && searchTerm ? 
            (isDarkMode ? 'from-yellow-500/50 to-amber-500/40 border-yellow-400/80 shadow-xl shadow-yellow-500/40 ring-2 ring-yellow-400/30' : 'from-yellow-100 to-amber-50 border-yellow-500 shadow-lg shadow-yellow-300/40 ring-2 ring-yellow-400') : 
            getItemColors(level, isExpanded, hasChildrenItems)
          } border rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-sm group ${
            level > 0 ? 'ml-8' : ''
          } cursor-pointer active:scale-[0.98]`}
          style={{ marginLeft: level > 0 ? `${level * 24}px` : '0' }}
          onClick={() => handleItemClick(item, hasChildrenItems)}
        >
          <div className="flex items-center gap-3">
            {/* Ícone de Expand/Collapse ou Indicador */}
            <div className="flex-shrink-0">
              {hasChildrenItems ? (
                isExpanded ? (
                  <div className={`rounded-lg p-1.5 transition-all duration-300 ${getIconColors(level, true)}`}>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className={`rounded-lg p-1.5 transition-all duration-300 ${getIconColors(level, false)}`}>
                    <ChevronRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-110" />
                  </div>
                )
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${getIndicatorColor(level)} animate-pulse`} />
              )}
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm transition-all duration-300 leading-relaxed ${
                hasChildrenItems ? 'font-bold' : 'font-medium'
              } ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'}`}>
                {highlightText(item.titulo || item.descricao, searchTerm)}
              </p>
            </div>

            {/* Badge de contagem */}
            {hasChildrenItems && (
              <div className={`flex-shrink-0 ${getBadgeColors(level)} text-xs px-3 py-1 rounded-full border transition-all duration-300 group-hover:scale-110`}>
                {children.length}
              </div>
            )}
          </div>

          {/* Badge de nível - exibe o nível hierárquico */}
          {level > 0 && (
            <div 
              className="absolute -left-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getIndicatorColor(level)} flex items-center justify-center text-[10px] font-bold text-white shadow-lg`}>
                {level}
              </div>
            </div>
          )}
          
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Filhos Expandidos com animação */}
        {isExpanded && children.length > 0 && (
          <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 fade-in duration-400 relative">
            {/* Linha vertical conectando todos os filhos */}
            <div 
              className="absolute top-0 bottom-3 w-0.5 bg-gradient-to-b from-slate-500/40 via-slate-600/30 to-transparent rounded-full"
              style={{ left: `${level * 24 + 12}px` }}
            />
            {children.map((child, index) => renderItem(child, level + 1, index === children.length - 1))}
          </div>
        )}
      </div>
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
    setExpandedItems({});
  };

  return (
    <aside className={`w-full h-[calc(100vh-5rem)] border-r shadow-2xl sticky top-20 overflow-hidden flex flex-col transition-colors duration-300 backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-700/60 shadow-black/50' : 'bg-gradient-to-b from-white via-gray-50 to-white border-gray-200 shadow-gray-300/50'}`}>
      {/* Header do Menu */}
      <div className={`p-6 border-b backdrop-blur-md transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 border-slate-600/60' : 'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-gray-200'}`}>
        {/* Efeito de fundo animado */}
        <div className={`absolute inset-0 animate-pulse ${isDarkMode ? 'bg-gradient-to-r from-blue-600/5 via-purple-600/10 to-blue-600/5' : 'bg-gradient-to-r from-gray-200/30 via-gray-300/40 to-gray-200/30'}`} />
        
        <div className="flex items-center gap-3 mb-5 relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl transition-transform duration-300 hover:scale-110 hover:rotate-6 ${isDarkMode ? 'bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 shadow-purple-500/50' : 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-gray-500/50'}`}>
            <HelpCircle className={`w-7 h-7 text-white ${isDarkMode ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h2 className={`text-xl font-black tracking-tight ${theme.text.primary}`}>Trilha de Dúvidas</h2>
            <p className={`text-xs font-medium ${theme.text.tertiary}`}>Navegue pelo passo a passo</p>
          </div>
        </div>

        {/* Campo de Busca */}
        <div className="relative group z-10">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${theme.text.tertiary} ${isDarkMode ? 'group-focus-within:text-blue-400' : 'group-focus-within:text-gray-700'}`} />
          <input
            type="text"
            placeholder="Buscar na trilha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:ring-blue-500/60 focus:border-blue-500/60 focus:bg-slate-900/90' : 'focus:ring-gray-400 focus:border-gray-500'}`}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-all duration-300 ${theme.text.tertiary} ${isDarkMode ? 'hover:text-white hover:bg-slate-700/50' : 'hover:text-gray-900 hover:bg-gray-200'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Resultados da busca */}
        {searchTerm && (
          <div className={`mt-3 text-xs font-medium flex items-center gap-2 relative z-10 ${theme.text.tertiary}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? 'bg-blue-400' : 'bg-gray-600'}`} />
            {filteredDecisoes.length} {filteredDecisoes.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </div>
        )}
      </div>

      {/* Conteúdo da Trilha */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="relative">
              <div className={`animate-spin rounded-full h-14 w-14 border-4 ${isDarkMode ? 'border-blue-500/30 border-t-blue-500' : 'border-gray-300 border-t-gray-700'}`}></div>
              <div className={`absolute inset-0 animate-ping rounded-full h-14 w-14 border-4 ${isDarkMode ? 'border-blue-500/20' : 'border-gray-200'}`}></div>
            </div>
            <p className={`text-sm font-medium ${theme.text.secondary}`}>Carregando trilha...</p>
          </div>
        ) : filteredDecisoes.length === 0 ? (
          <div className="text-center p-12">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/30' : 'bg-gradient-to-br from-gray-200 to-gray-100'}`}>
              <Search className={`w-10 h-10 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <p className={`font-semibold mb-2 text-base ${theme.text.secondary}`}>Nenhum resultado encontrado</p>
            <p className={`text-xs ${theme.text.tertiary}`}>Tente buscar com outros termos</p>
          </div>
        ) : (
          filteredDecisoes.map(decisao => renderItem(decisao))
        )}
      </div>

      {/* Footer com Info */}
      <div className={`p-5 border-t backdrop-blur-md transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/95 border-slate-700/60' : 'bg-gradient-to-t from-white via-gray-50/98 to-gray-50/95 border-gray-200'}`}>
        {/* Efeito de fundo animado */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-t from-blue-600/5 to-transparent' : 'bg-gradient-to-t from-gray-100/50 to-transparent'}`} />
        
        <div className={`flex items-center gap-3 text-xs font-medium relative z-10 ${theme.text.tertiary}`}>
          <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-gray-200'}`}>
            <List className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-gray-600'}`} />
          </div>
          <span className="leading-relaxed">Clique nos itens para expandir e ver mais detalhes</span>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(229, 231, 235, 0.4)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #6b7280 100%)'};
          border-radius: 10px;
          box-shadow: ${isDarkMode ? '0 0 10px rgba(59, 130, 246, 0.5)' : '0 0 10px rgba(107, 114, 128, 0.3)'};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #2563eb 100%)' : 'linear-gradient(135deg, #4b5563 0%, #374151 50%, #4b5563 100%)'};
          box-shadow: ${isDarkMode ? '0 0 15px rgba(59, 130, 246, 0.8)' : '0 0 15px rgba(107, 114, 128, 0.5)'};
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
        }
      `}</style>
    </aside>
  );
});

MenuLateral.displayName = 'MenuLateral';

export default MenuLateral;
