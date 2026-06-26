import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { ChevronDown, ChevronRight, BookOpen, Search, X, Loader2, Circle } from "lucide-react";
import TrilhaService from "../services/TrilhaService";

const MenuLateral = forwardRef(({ onSelectTrilha }, ref) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [trilhas, setTrilhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTrilhas, setFilteredTrilhas] = useState([]);
  const [selectedTrilhaId, setSelectedTrilhaId] = useState(null);

  // Funções auxiliares declaradas antes do uso
  const fetchTrilhas = async () => {
    try {
      const data = await TrilhaService.buscarTrilhas();
      const trilhasFormatadas = TrilhaService.transformarParaFormato(data);
      setTrilhas(trilhasFormatadas);
      setFilteredTrilhas(trilhasFormatadas);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar trilhas:", error);
      setLoading(false);
    }
  };

  const expandParentsOfTrilha = (trilhaId) => {
    const findAndExpandParents = (items, targetId, parents = []) => {
      for (const item of items) {
        if (item.id === targetId) {
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
    findAndExpandParents(trilhas, trilhaId);
  };

  const filterTrilhas = (items, term) => {
    return items.reduce((acc, item) => {
      const matchesSearch = (item.descricao && item.descricao.toLowerCase().includes(term)) || 
                           (item.titulo && item.titulo.toLowerCase().includes(term));
      
      const matchesSubmenu = item.submenus && item.submenus.some(submenu => 
        (submenu.descricao && submenu.descricao.toLowerCase().includes(term)) || 
        (submenu.titulo && submenu.titulo.toLowerCase().includes(term))
      );
      
      const filteredChildren = item.all_children ? filterTrilhas(item.all_children, term) : [];
      
      if (matchesSearch || matchesSubmenu || filteredChildren.length > 0) {
        acc.push({
          ...item,
          all_children: filteredChildren,
          highlighted: matchesSearch || matchesSubmenu
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

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Conjunto de ids do caminho ativo: trilha selecionada + todos os seus pais
  const activePathIds = useMemo(() => {
    const path = new Set();
    const find = (items, parents) => {
      for (const item of items) {
        const currentPath = [...parents, item.id];
        if (item.id === selectedTrilhaId) {
          currentPath.forEach(id => path.add(id));
          return true;
        }
        if (item.all_children && item.all_children.length > 0) {
          if (find(item.all_children, currentPath)) return true;
        }
      }
      return false;
    };
    if (selectedTrilhaId != null) find(trilhas, []);
    return path;
  }, [selectedTrilhaId, trilhas]);

  // Hooks devem vir após declaração de todas as funções
  useEffect(() => {
    fetchTrilhas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTrilhas(trilhas);
    } else {
      const filtered = filterTrilhas(trilhas, searchTerm.toLowerCase());
      setFilteredTrilhas(filtered);
      if (filtered.length > 0) {
        const idsToExpand = {};
        filtered.forEach(item => expandAllParents(item, idsToExpand));
        setExpandedItems(idsToExpand);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, trilhas]);

  // Expor método para selecionar trilha externamente
  useImperativeHandle(ref, () => ({
    selectTrilha: (trilhaId) => {
      setSelectedTrilhaId(trilhaId);
      expandParentsOfTrilha(trilhaId);
      setTimeout(() => {
        const element = document.getElementById(`trilha-item-${trilhaId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }));

  const handleItemClick = (item, hasChildrenItems) => {
    setSelectedTrilhaId(item.id);
    
    if (onSelectTrilha) {
      onSelectTrilha(item);
    }
    
    if (hasChildrenItems) {
      toggleExpand(item.id);
    }
  };

  const highlightText = (text, term) => {
    if (!term.trim()) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === term.toLowerCase() ? 
        <mark key={index} className="bg-red-100 text-red-900 px-1 rounded font-semibold">{part}</mark> : 
        part
    );
  };

  const renderItem = (item, level = 0) => {
    const isExpanded = expandedItems[item.id];
    const children = item.all_children || [];
    const hasChildrenItems = children.length > 0;
    const isSelected = selectedTrilhaId === item.id;
    const isInPath = activePathIds.has(item.id);

    return (
      <div key={item.id} id={`trilha-item-${item.id}`}>
        {/* Item */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer transition-all ${
            isSelected 
              ? 'bg-red-50 text-red-600' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          style={{ marginLeft: level > 0 ? `${level * 12}px` : '0' }}
          onClick={() => handleItemClick(item, hasChildrenItems)}
        >
          {/* Ícone */}
          <div className="flex-shrink-0">
            {hasChildrenItems ? (
              isExpanded ? (
                <ChevronDown className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-gray-400'}`} />
              ) : (
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-gray-400'}`} />
              )
            ) : (
              <Circle className={`w-1.5 h-1.5 ${isSelected ? 'fill-red-500 text-red-500' : 'fill-gray-300 text-gray-300'}`} />
            )}
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <div className={`text-xs truncate ${
              isSelected
                ? 'text-red-700 font-bold'
                : isInPath
                  ? 'text-gray-900 font-bold'
                  : 'text-gray-700 font-medium'
            }`}>
              {searchTerm ? highlightText(item.titulo || item.descricao, searchTerm) : (item.titulo || item.descricao)}
            </div>
          </div>

          {/* Número/Badge */}
          {hasChildrenItems && (
            <div className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
              isSelected ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {children.length}
            </div>
          )}
        </div>

        {/* Filhos Expandidos */}
        {isExpanded && children.length > 0 && (
          <div className="mt-0.5 space-y-0.5">
            {children.map((child) => renderItem(child, level + 1))}
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
    <aside className="w-full h-[calc(100vh-3.5rem)] border-r border-gray-200 bg-white sticky top-14 overflow-hidden flex flex-col shadow-sm">
      {/* Header do Menu */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Categorias</h2>
          </div>
        </div>

        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-md pl-8 pr-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all bg-gray-50"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Resultados da busca */}
        {searchTerm && (
          <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1.5">
            <Circle className="w-1 h-1 fill-red-500 text-red-500" />
            {filteredTrilhas.length} {filteredTrilhas.length === 1 ? 'resultado' : 'resultados'}
          </div>
        )}
      </div>

      {/* Conteúdo da Trilha */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-xs font-medium text-gray-500">Carregando...</p>
          </div>
        ) : filteredTrilhas.length === 0 ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="font-medium mb-1 text-gray-600 text-xs">Nenhum resultado</p>
            <p className="text-[10px] text-gray-400">Tente outros termos</p>
          </div>
        ) : (
          filteredTrilhas.map(trilha => renderItem(trilha))
        )}
      </div>
    </aside>
  );
});

MenuLateral.displayName = 'MenuLateral';

export default MenuLateral;
