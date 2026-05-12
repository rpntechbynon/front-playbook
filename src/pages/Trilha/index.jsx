/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import MenuSuperior from "../MenuSuperior";
import MenuLateral from "../../components/Menulateral";
import MenuDireito from "../../components/MenuDireito";
import { FileText, Image as ImageIcon, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import API_BASE_URL from "../../config/api";

export default function Trilha() {
  const { theme, isDarkMode } = useTheme();
  const [selectedTrilha, setSelectedTrilha] = useState(null);
  const [isMenuDireitoMinimized, setIsMenuDireitoMinimized] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [selectedSubmenuImages, setSelectedSubmenuImages] = useState([]);
  const [currentSubmenuImageIndex, setCurrentSubmenuImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const menuLateralRef = useRef();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleSelectTrilha = (trilha) => {
    // Verificar se é a mesma trilha para evitar loading desnecessário
    const isSameTrilha = selectedTrilha?.id === trilha?.id;
    
    setSelectedTrilha(trilha);
    setSelectedAttachmentIndex(0); // Resetar para o primeiro anexo
    setSelectedSubmenuImages([]); // Limpar imagens do submenu
    setCurrentSubmenuImageIndex(0); // Resetar índice
    
    // Só ativar loading se for uma trilha diferente
    if (!isSameTrilha) {
      setIsImageLoading(true);
    }
    
    // Expandir o menu direito se houver go_to
    if (trilha?.go_to) {
      setIsMenuDireitoMinimized(false);
    }
  };

  const handleSelectDestination = (destination) => {
    // Verificar se é o mesmo destino para evitar loading desnecessário
    const isSameDestination = selectedTrilha?.id === destination?.id;
    
    // Quando selecionar um destino no menu direito, atualiza a trilha selecionada
    setSelectedTrilha(destination);
    setSelectedSubmenuImages([]); // Limpar imagens do submenu
    setCurrentSubmenuImageIndex(0); // Resetar índice
    
    // Só ativar loading se for um destino diferente
    if (!isSameDestination) {
      setIsImageLoading(true);
    }
    
    // Seleciona a trilha no menu lateral
    if (menuLateralRef.current) {
      menuLateralRef.current.selectTrilha(destination.id);
    }
  };

  const handleSelectSubmenuDocument = (document) => {
    // Encontrar o índice do documento nos anexos visualizáveis (incluindo submenus para navegação)
    const allDocs = getAllDocumentsIncludingSubmenus();
    const viewableDocs = allDocs.filter(doc => 
      doc.tipo?.startsWith('image/') || 
      doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
      doc.tipo === 'application/pdf' || 
      doc.nome?.match(/\.pdf$/i)
    );
    const index = viewableDocs.findIndex(doc => doc.id === document.id);
    if (index !== -1) {
      setSelectedAttachmentIndex(index);
    }
  };

  const handleSelectSubmenuImages = (images, startIndex = 0) => {
    // Verificar se são as mesmas imagens para evitar loading desnecessário
    const areSameImages = selectedSubmenuImages.length === images.length && 
                          selectedSubmenuImages.length > 0 &&
                          selectedSubmenuImages[0]?.id === images[0]?.id;
    
    setSelectedSubmenuImages(images);
    setCurrentSubmenuImageIndex(startIndex);
    
    // Só ativar loading se forem imagens diferentes
    if (!areSameImages) {
      setIsImageLoading(true);
    }
  };

  // Coletar apenas documentos da etapa principal (sem submenus)
  const getAllDocuments = useCallback(() => {
    if (!selectedTrilha) return [];
    
    let allDocs = [];
    
    // Adicionar apenas documentos da etapa principal
    if (selectedTrilha.documentos && selectedTrilha.documentos.length > 0) {
      allDocs = [...selectedTrilha.documentos];
    }
    
    return allDocs;
  }, [selectedTrilha]);
  
  // Função auxiliar para coletar documentos incluindo submenus (usado para navegação do visualizador)
  const getAllDocumentsIncludingSubmenus = useCallback(() => {
    if (!selectedTrilha) return [];
    
    let allDocs = [];
    
    // Adicionar documentos da etapa principal
    if (selectedTrilha.documentos && selectedTrilha.documentos.length > 0) {
      allDocs = [...selectedTrilha.documentos];
    }
    
    // Adicionar documentos dos submenus
    if (selectedTrilha.submenus && selectedTrilha.submenus.length > 0) {
      selectedTrilha.submenus.forEach(submenu => {
        if (submenu.documentos && submenu.documentos.length > 0) {
          allDocs = [...allDocs, ...submenu.documentos];
        }
      });
    }
    
    return allDocs;
  }, [selectedTrilha]);

  // Verificar se tem documentos e separar por tipo
  // Para a lista: apenas documentos da etapa principal
  const allDocuments = getAllDocuments();
  const hasAttachments = allDocuments.length > 0;
  const imageAttachments = useMemo(() => 
    hasAttachments 
      ? allDocuments.filter(doc => 
          doc.tipo?.startsWith('image/') || doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        )
      : []
  , [allDocuments, hasAttachments]);
  const otherAttachments = useMemo(() => 
    hasAttachments
      ? allDocuments.filter(doc => 
          !(doc.tipo?.startsWith('image/') || doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) &&
          !(doc.tipo === 'application/pdf' || doc.nome?.match(/\.pdf$/i))
        )
      : []
  , [allDocuments, hasAttachments]);
  
  // Lógica simplificada: verificar se estamos em modo submenu ou normal
  const isSubmenuMode = selectedSubmenuImages.length > 0;
  
  // Imagens para exibir: submenu OU etapa principal (nunca ambos)
  const imagesToDisplay = isSubmenuMode ? selectedSubmenuImages : imageAttachments;
  const currentImageIndex = isSubmenuMode ? currentSubmenuImageIndex : selectedAttachmentIndex;
  const currentImage = imagesToDisplay[currentImageIndex];
  
  // Obter URL do anexo (usar url_presignada se disponível)
  const getAttachmentUrl = (documento) => {
    // Prioridade 1: url_presignada (AWS S3 com assinatura)
    if (documento.url_presignada) {
      return documento.url_presignada;
    }
    
    // Prioridade 2: campo url (pode ser S3 ou outra URL completa)
    if (documento.url && (documento.url.startsWith('http://') || documento.url.startsWith('https://'))) {
      return documento.url;
    }
    
    // Prioridade 3: caminho relativo - construir URL local
    if (documento.caminho) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      return `${baseUrl}/storage/${documento.caminho}`;
    }
    
    return '';
  };

  // Funções de navegação para imagens de submenu
  const nextSubmenuImage = useCallback(() => {
    if (selectedSubmenuImages.length > 0) {
      setIsImageLoading(true); // Ativar loading
      const newIndex = (currentSubmenuImageIndex + 1) % selectedSubmenuImages.length;
      setCurrentSubmenuImageIndex(newIndex);
    }
  }, [selectedSubmenuImages.length, currentSubmenuImageIndex]);

  const prevSubmenuImage = useCallback(() => {
    if (selectedSubmenuImages.length > 0) {
      setIsImageLoading(true); // Ativar loading
      const newIndex = (currentSubmenuImageIndex - 1 + selectedSubmenuImages.length) % selectedSubmenuImages.length;
      setCurrentSubmenuImageIndex(newIndex);
    }
  }, [selectedSubmenuImages.length, currentSubmenuImageIndex]);

  const selectSubmenuImage = useCallback((index) => {
    setIsImageLoading(true); // Ativar loading
    setCurrentSubmenuImageIndex(index);
  }, []);

  // Funções de navegação para imagens normais (etapa principal)
  const nextImage = useCallback(() => {
    if (imageAttachments.length > 0) {
      setIsImageLoading(true); // Ativar loading
      const newIndex = (selectedAttachmentIndex + 1) % imageAttachments.length;
      setSelectedAttachmentIndex(newIndex);
    }
  }, [imageAttachments.length, selectedAttachmentIndex]);

  const prevImage = useCallback(() => {
    if (imageAttachments.length > 0) {
      setIsImageLoading(true); // Ativar loading
      const newIndex = (selectedAttachmentIndex - 1 + imageAttachments.length) % imageAttachments.length;
      setSelectedAttachmentIndex(newIndex);
    }
  }, [imageAttachments.length, selectedAttachmentIndex]);

  // Handlers para gestos de swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50; // mínimo de pixels para considerar um swipe
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (isSubmenuMode) {
        // Carrossel de submenu
        if (swipeDistance > 0) {
          nextSubmenuImage();
        } else {
          prevSubmenuImage();
        }
      } else if (imageAttachments.length > 1) {
        // Carrossel normal
        if (swipeDistance > 0) {
          nextImage();
        } else {
          prevImage();
        }
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSubmenuMode && selectedSubmenuImages.length > 1) {
        // Navegação no carrossel de submenu
        if (e.key === 'ArrowLeft') {
          prevSubmenuImage();
        } else if (e.key === 'ArrowRight') {
          nextSubmenuImage();
        }
      } else if (!isSubmenuMode && imageAttachments.length > 1) {
        // Navegação no carrossel normal
        if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmenuMode, selectedSubmenuImages.length, prevSubmenuImage, nextSubmenuImage, imageAttachments.length, prevImage, nextImage]);

  // Preload das imagens adjacentes para melhor performance
  useEffect(() => {
    if (isSubmenuMode && selectedSubmenuImages.length > 1) {
      // Preload para carrossel de submenu
      const preloadImages = [];
      
      const nextIndex = (currentSubmenuImageIndex + 1) % selectedSubmenuImages.length;
      if (selectedSubmenuImages[nextIndex]) {
        const img = new Image();
        img.src = getAttachmentUrl(selectedSubmenuImages[nextIndex]);
        preloadImages.push(img);
      }
      
      const prevIndex = (currentSubmenuImageIndex - 1 + selectedSubmenuImages.length) % selectedSubmenuImages.length;
      if (selectedSubmenuImages[prevIndex] && prevIndex !== nextIndex) {
        const img = new Image();
        img.src = getAttachmentUrl(selectedSubmenuImages[prevIndex]);
        preloadImages.push(img);
      }
    } else if (!isSubmenuMode && imageAttachments.length > 1) {
      // Preload para carrossel normal
      const preloadImages = [];
      
      const nextIndex = (selectedAttachmentIndex + 1) % imageAttachments.length;
      if (imageAttachments[nextIndex]) {
        const img = new Image();
        img.src = getAttachmentUrl(imageAttachments[nextIndex]);
        preloadImages.push(img);
      }
      
      const prevIndex = (selectedAttachmentIndex - 1 + imageAttachments.length) % imageAttachments.length;
      if (imageAttachments[prevIndex] && prevIndex !== nextIndex) {
        const img = new Image();
        img.src = getAttachmentUrl(imageAttachments[prevIndex]);
        preloadImages.push(img);
      }
    }
  }, [isSubmenuMode, currentSubmenuImageIndex, selectedSubmenuImages, selectedAttachmentIndex, imageAttachments]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      {/* Menu Superior */}
      <MenuSuperior />

      {/* Container Principal */}
      <div className={`grid pt-20 transition-all duration-300 ${isMenuDireitoMinimized ? 'grid-cols-[23%_60px_calc(77%-60px)]' : 'grid-cols-[23%_23%_54%]'}`}>
        {/* Menu Lateral Esquerdo */}
        <MenuLateral ref={menuLateralRef} onSelectTrilha={handleSelectTrilha} />
        
        {/* Menu Direito (continuidade) */}
        <MenuDireito 
          selectedTrilha={selectedTrilha} 
          onSelectDestination={handleSelectDestination}
          onSelectSubmenuDocument={handleSelectSubmenuDocument}
          onSelectSubmenuImages={handleSelectSubmenuImages}
          isMinimized={isMenuDireitoMinimized}
          onToggleMinimize={() => setIsMenuDireitoMinimized(!isMenuDireitoMinimized)}
        />

        {/* Área de Conteúdo Principal */}
        <main className="h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
          {selectedTrilha ? (
            <>
              

              {/* Área de Anexos */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {imagesToDisplay.length > 0 ? (
                  <>
                    {/* Visualizador de Imagens */}
                    <div 
                      className={`flex-1 flex items-center justify-center overflow-hidden relative ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-100'}`}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {currentImage ? (
                        <>
                          {/* Loading Spinner */}
                          {isImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-20">
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-white'}`}>
                                  Carregando imagem...
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <img 
                            src={getAttachmentUrl(currentImage)} 
                            alt={currentImage.nome}
                            className={`w-full h-full object-contain transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            loading="lazy"
                            onError={(e) => {
                              console.error('Erro ao carregar imagem:', e.target.src);
                              console.error('Documento:', currentImage);
                              setIsImageLoading(false); // Desativar loading em caso de erro
                            }}
                            onLoad={() => {
                              console.log('Imagem carregada com sucesso:', getAttachmentUrl(currentImage));
                              setIsImageLoading(false); // Desativar loading quando carregar
                            }}
                          />
                          
                          {/* Controles do Carrossel - Mostrar se tiver mais de 1 imagem */}
                          {imagesToDisplay.length > 1 && (
                            <>
                              {/* Botão Anterior */}
                              <button
                                onClick={isSubmenuMode ? prevSubmenuImage : prevImage}
                                className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10 ${isDarkMode ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600' : 'bg-white/90 hover:bg-gray-50 text-gray-800 border border-gray-300'}`}
                                title="Imagem anterior"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              
                              {/* Botão Próximo */}
                              <button
                                onClick={isSubmenuMode ? nextSubmenuImage : nextImage}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10 ${isDarkMode ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600' : 'bg-white/90 hover:bg-gray-50 text-gray-800 border border-gray-300'}`}
                                title="Próxima imagem"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </button>
                              
                              {/* Indicadores de posição (dots) */}
                              <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full ${isDarkMode ? 'bg-slate-800/90' : 'bg-white/90'} shadow-lg`}>
                                {imagesToDisplay.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      if (isSubmenuMode) {
                                        selectSubmenuImage(index);
                                      } else {
                                        setIsImageLoading(true);
                                        setSelectedAttachmentIndex(index);
                                      }
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                      index === currentImageIndex 
                                        ? (isDarkMode ? 'bg-blue-400 w-8' : 'bg-gray-800 w-8')
                                        : (isDarkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-300 hover:bg-gray-400')
                                    }`}
                                    title={`Imagem ${index + 1} de ${imagesToDisplay.length}`}
                                  />
                                ))}
                              </div>
                              
                              {/* Contador de imagens */}
                              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${isDarkMode ? 'bg-slate-800/90 text-white' : 'bg-white/90 text-gray-800'}`}>
                                {currentImageIndex + 1} / {imagesToDisplay.length}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className={`flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <ImageIcon className="w-16 h-16" />
                          <p className="text-lg">Nenhuma imagem disponível</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Galeria de Miniaturas */}
                    {imagesToDisplay.length > 1 && (
                      <div className={`border-t p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {imagesToDisplay.map((image, index) => {
                            const isActive = index === currentImageIndex;
                            
                            return (
                              <button
                                key={image.id || index}
                                onClick={() => {
                                  if (isSubmenuMode) {
                                    selectSubmenuImage(index);
                                  } else {
                                    setIsImageLoading(true);
                                    setSelectedAttachmentIndex(index);
                                  }
                                }}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  isActive 
                                    ? (isDarkMode ? 'border-blue-500 ring-2 ring-blue-400/50' : 'border-gray-700 ring-2 ring-gray-400') + ' scale-105'
                                    : isDarkMode ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <img 
                                  src={getAttachmentUrl(image)} 
                                  alt={image.nome}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            );
                          })}
                        </div>
                        <p className={`text-xs mt-2 text-center ${theme.text.tertiary}`}>
                          {currentImage?.nome} ({currentImageIndex + 1} de {imagesToDisplay.length})
                        </p>
                      </div>
                    )}
                  </>
                ) : otherAttachments.length > 0 ? (
                  <div className="h-full overflow-y-auto p-6">
                    <h3 className={`text-lg font-bold mb-4 ${theme.text.primary}`}>Anexos disponíveis</h3>
                    <div className="space-y-3">
                      {otherAttachments.map((doc, index) => (
                        <a
                          key={index}
                          href={getAttachmentUrl(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 p-4 border rounded-xl transition-all duration-200 group ${isDarkMode ? 'bg-slate-800/60 border-slate-600/50 hover:bg-slate-700/60 hover:border-slate-500/50' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                            <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${theme.text.primary}`}>{doc.nome}</p>
                            <p className={`text-xs ${theme.text.tertiary}`}>{doc.tipo || 'Arquivo'}</p>
                          </div>
                          <Download className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                      <p className={theme.text.tertiary}>Nenhum anexo disponível para esta trilha</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full text-center">
                <div className={`border rounded-2xl p-12 shadow-2xl ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
                  <h1 className={`text-3xl font-bold mb-4 ${theme.text.primary}`}>
                    Bem-vindo à Trilha de Vendas
                  </h1>
                  <p className={theme.text.secondary}>
                    Selecione uma etapa no menu lateral para começar seu aprendizado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
