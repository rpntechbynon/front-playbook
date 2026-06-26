import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import MenuSuperior from "../MenuSuperior";
import MenuLateral from "../../components/Menulateral";
import MenuDireito from "../../components/MenuDireito";
import { FileText, Image as ImageIcon, Download, ChevronLeft, ChevronRight, Loader2, ClipboardList, CheckCircle } from "lucide-react";
import API_BASE_URL from "../../config/api";

// Componente otimizado para miniaturas com Intersection Observer
const LazyThumbnail = ({ src, alt, isActive, onClick, index, currentIndex }) => {
  const shouldLoadImmediately = useMemo(() => {
    const distance = Math.abs(index - currentIndex);
    return distance <= 3; // Carregar apenas imagens muito próximas
  }, [index, currentIndex]);
  
  const [isVisible, setIsVisible] = useState(shouldLoadImmediately);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (shouldLoadImmediately) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { rootMargin: '150px' } // Aumentar margem para carregar antes
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoadImmediately]);

  return (
    <button
      ref={imgRef}
      onClick={onClick}
      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
        isActive 
          ? 'border-red-500 ring-2 ring-red-200 scale-105 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {isVisible ? (
        <img 
          src={src} 
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 ${hasLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setHasLoaded(true)}
          onError={() => setHasLoaded(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
    </button>
  );
};

export default function Trilha() {
  const [selectedTrilha, setSelectedTrilha] = useState(null);
  const [isMenuDireitoMinimized, setIsMenuDireitoMinimized] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [selectedSubmenuImages, setSelectedSubmenuImages] = useState([]);
  const [currentSubmenuImageIndex, setCurrentSubmenuImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const menuLateralRef = useRef();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const imageCache = useRef(new Map());
  const loadTimeoutRef = useRef(null);
  const highResImageRef = useRef(null);

  const [selectedFormularios, setSelectedFormularios] = useState([]);
  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [enviandoRespostas, setEnviandoRespostas] = useState(false);
  const [respostaEnviada, setRespostaEnviada] = useState(false);

  // Função otimizada para pré-carregar imagens
  const preloadImage = useCallback((url) => {
    if (!url || loadedImages.has(url) || imageCache.current.has(url)) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(url, true);
        setLoadedImages(prev => new Set([...prev, url]));
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }, [loadedImages]);

  const handleSelectTrilha = (trilha) => {
    const isSameTrilha = selectedTrilha?.id === trilha?.id;

    setSelectedTrilha(trilha);
    setSelectedAttachmentIndex(0);
    setSelectedSubmenuImages([]);
    setCurrentSubmenuImageIndex(0);
    setSelectedFormularios(trilha?.formularios || []);
    setActiveFormIndex(0);
    setRespostas({});
    setRespostaEnviada(false);

    if (!isSameTrilha) {
      setIsImageLoading(true);
      setHighResLoaded(false);
    }

    if (trilha?.go_to) {
      setIsMenuDireitoMinimized(false);
    }
  };

  const handleSelectDestination = (destination) => {
    const isSameDestination = selectedTrilha?.id === destination?.id;

    setSelectedTrilha(destination);
    setSelectedSubmenuImages([]);
    setCurrentSubmenuImageIndex(0);
    setSelectedFormularios(destination?.formularios || []);
    setActiveFormIndex(0);
    setRespostas({});
    setRespostaEnviada(false);

    if (!isSameDestination) {
      setIsImageLoading(true);
      setHighResLoaded(false);
    }

    if (menuLateralRef.current) {
      menuLateralRef.current.selectTrilha(destination.id);
    }
  };

  const handleSelectSubmenuDocument = (document) => {
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
    const areSameImages = selectedSubmenuImages.length === images.length &&
                          selectedSubmenuImages.length > 0 &&
                          selectedSubmenuImages[0]?.id === images[0]?.id;

    setSelectedSubmenuImages(images);
    setCurrentSubmenuImageIndex(startIndex);
    setSelectedFormularios([]);

    if (!areSameImages) {
      setIsImageLoading(true);
      setHighResLoaded(false);
    }
  };

  const handleSelectSubmenuFormularios = (formularios) => {
    setSelectedFormularios(formularios);
    setSelectedSubmenuImages([]);
    setActiveFormIndex(0);
    setRespostas({});
    setRespostaEnviada(false);
  };

  const getAllDocuments = useCallback(() => {
    if (!selectedTrilha) return [];
    
    let allDocs = [];
    
    if (selectedTrilha.documentos && selectedTrilha.documentos.length > 0) {
      allDocs = [...selectedTrilha.documentos];
    }
    
    return allDocs;
  }, [selectedTrilha]);
  
  const getAllDocumentsIncludingSubmenus = useCallback(() => {
    if (!selectedTrilha) return [];
    
    let allDocs = [];
    
    if (selectedTrilha.documentos && selectedTrilha.documentos.length > 0) {
      allDocs = [...selectedTrilha.documentos];
    }
    
    if (selectedTrilha.submenus && selectedTrilha.submenus.length > 0) {
      selectedTrilha.submenus.forEach(submenu => {
        if (submenu.documentos && submenu.documentos.length > 0) {
          allDocs = [...allDocs, ...submenu.documentos];
        }
      });
    }
    
    return allDocs;
  }, [selectedTrilha]);

  const enviarRespostas = async () => {
    const formAtivo = selectedFormularios[activeFormIndex];
    if (!formAtivo) return;

    const perguntas = [...(formAtivo.perguntas || [])].sort((a, b) => a.ordem - b.ordem);
    const respostasArray = perguntas.map(p => ({ pergunta_id: p.id, valor: respostas[p.id] }));

    setEnviandoRespostas(true);
    try {
      await fetch(`${API_BASE_URL}/formularios/${formAtivo.id}/respostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas: respostasArray }),
      });
      setRespostaEnviada(true);
    } catch (e) {
      console.error('Erro ao enviar respostas:', e);
    } finally {
      setEnviandoRespostas(false);
    }
  };

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
  
  const isSubmenuMode = selectedSubmenuImages.length > 0;
  
  const imagesToDisplay = isSubmenuMode ? selectedSubmenuImages : imageAttachments;
  const currentImageIndex = isSubmenuMode ? currentSubmenuImageIndex : selectedAttachmentIndex;
  const currentImage = imagesToDisplay[currentImageIndex];
  
  const getAttachmentUrl = (documento) => {
    if (documento.url_presignada) {
      return documento.url_presignada;
    }
    
    if (documento.url && (documento.url.startsWith('http://') || documento.url.startsWith('https://'))) {
      return documento.url;
    }
    
    if (documento.caminho) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      return `${baseUrl}/storage/${documento.caminho}`;
    }
    
    return '';
  };

  const nextSubmenuImage = useCallback(() => {
    if (selectedSubmenuImages.length > 0) {
      setIsImageLoading(true);
      setHighResLoaded(false);
      const newIndex = (currentSubmenuImageIndex + 1) % selectedSubmenuImages.length;
      setCurrentSubmenuImageIndex(newIndex);
    }
  }, [selectedSubmenuImages.length, currentSubmenuImageIndex]);

  const prevSubmenuImage = useCallback(() => {
    if (selectedSubmenuImages.length > 0) {
      setIsImageLoading(true);
      setHighResLoaded(false);
      const newIndex = (currentSubmenuImageIndex - 1 + selectedSubmenuImages.length) % selectedSubmenuImages.length;
      setCurrentSubmenuImageIndex(newIndex);
    }
  }, [selectedSubmenuImages.length, currentSubmenuImageIndex]);

  const selectSubmenuImage = useCallback((index) => {
    setIsImageLoading(true);
    setHighResLoaded(false);
    setCurrentSubmenuImageIndex(index);
  }, []);

  const nextImage = useCallback(() => {
    if (imageAttachments.length > 0) {
      setIsImageLoading(true);
      setHighResLoaded(false);
      const newIndex = (selectedAttachmentIndex + 1) % imageAttachments.length;
      setSelectedAttachmentIndex(newIndex);
    }
  }, [imageAttachments.length, selectedAttachmentIndex]);

  const prevImage = useCallback(() => {
    if (imageAttachments.length > 0) {
      setIsImageLoading(true);
      setHighResLoaded(false);
      const newIndex = (selectedAttachmentIndex - 1 + imageAttachments.length) % imageAttachments.length;
      setSelectedAttachmentIndex(newIndex);
    }
  }, [imageAttachments.length, selectedAttachmentIndex]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (isSubmenuMode) {
        if (swipeDistance > 0) {
          nextSubmenuImage();
        } else {
          prevSubmenuImage();
        }
      } else if (imageAttachments.length > 1) {
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSubmenuMode && selectedSubmenuImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          prevSubmenuImage();
        } else if (e.key === 'ArrowRight') {
          nextSubmenuImage();
        }
      } else if (!isSubmenuMode && imageAttachments.length > 1) {
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

  // Otimização: pré-carregar APENAS próxima e anterior imagem (não todas)
  useEffect(() => {
    const imagesToPreload = isSubmenuMode ? selectedSubmenuImages : imageAttachments;
    if (imagesToPreload.length <= 1) return;

    // Carregar apenas próxima e anterior para economizar banda
    const nextIndex = (currentImageIndex + 1) % imagesToPreload.length;
    const prevIndex = (currentImageIndex - 1 + imagesToPreload.length) % imagesToPreload.length;
    
    const priorityUrls = [
      getAttachmentUrl(imagesToPreload[nextIndex]),
      getAttachmentUrl(imagesToPreload[prevIndex])
    ].filter(Boolean);

    // Pré-carregar com delay pequeno para não competir com imagem atual
    setTimeout(() => {
      priorityUrls.forEach(url => preloadImage(url));
    }, 300);
  }, [isSubmenuMode, currentImageIndex, selectedSubmenuImages, imageAttachments, preloadImage]);

  // Cleanup do timeout de loading ao desmontar
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  const formAtivo = selectedFormularios[activeFormIndex] ?? null;
  const perguntasDoForm = [...(formAtivo?.perguntas || [])].sort((a, b) => a.ordem - b.ordem);
  const totalPerguntas = perguntasDoForm.length;
  const respondidas = perguntasDoForm.filter(p => respostas[p.id] !== undefined).length;
  const hasFormularios = selectedFormularios.length > 0;

  // Envia as respostas automaticamente assim que todas as perguntas forem respondidas
  useEffect(() => {
    if (
      totalPerguntas > 0 &&
      respondidas === totalPerguntas &&
      !respostaEnviada &&
      !enviandoRespostas
    ) {
      enviarRespostas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respondidas, totalPerguntas, respostaEnviada, enviandoRespostas]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Menu Superior */}
      <MenuSuperior />

      {/* Container Principal */}
      <div className={`grid pt-14 transition-all duration-300 ${isMenuDireitoMinimized ? 'grid-cols-[23%_60px_calc(77%-60px)]' : 'grid-cols-[23%_23%_54%]'}`}>
        {/* Menu Lateral Esquerdo */}
        <MenuLateral ref={menuLateralRef} onSelectTrilha={handleSelectTrilha} />
        
        {/* Menu Direito */}
        <MenuDireito
          selectedTrilha={selectedTrilha}
          onSelectDestination={handleSelectDestination}
          onSelectSubmenuDocument={handleSelectSubmenuDocument}
          onSelectSubmenuImages={handleSelectSubmenuImages}
          onSelectSubmenuFormularios={handleSelectSubmenuFormularios}
          isMinimized={isMenuDireitoMinimized}
          onToggleMinimize={() => setIsMenuDireitoMinimized(!isMenuDireitoMinimized)}
        />

        {/* Área de Conteúdo Principal */}
        <main className="h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-white">
          {selectedTrilha ? (
            <>
              {/* Área de Conteúdo */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {hasFormularios ? (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Abas quando há múltiplos formulários */}
                    {selectedFormularios.length > 1 && (
                      <div className="border-b border-gray-200 flex overflow-x-auto flex-shrink-0 bg-white">
                        {selectedFormularios.map((f, i) => (
                          <button
                            key={f.id}
                            onClick={() => { setActiveFormIndex(i); setRespostas({}); setRespostaEnviada(false); }}
                            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                              i === activeFormIndex
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {f.titulo}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                      {formAtivo && (
                        respostaEnviada ? (
                          /* Estado de sucesso */
                          <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="text-base font-bold text-gray-800 mb-1">Respostas enviadas!</h3>
                            <p className="text-gray-500 text-xs mb-5">Atendimento registrado com sucesso.</p>
                            <div className="w-full max-w-md space-y-1.5 mb-5 text-left">
                              {perguntasDoForm.map(p => (
                                <div
                                  key={p.id}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm border ${
                                    respostas[p.id] === true
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-red-50 border-red-200'
                                  }`}
                                >
                                  <span className={`text-xs font-bold flex-shrink-0 w-7 ${respostas[p.id] === true ? 'text-green-600' : 'text-red-500'}`}>
                                    {respostas[p.id] === true ? 'Sim' : 'Não'}
                                  </span>
                                  <span className="text-gray-600 text-xs">{p.texto}</span>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => { setRespostas({}); setRespostaEnviada(false); }}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm rounded-md transition-colors"
                            >
                              Responder Novamente
                            </button>
                          </div>
                        ) : (
                          /* Formulário de perguntas */
                          <div className="p-5 max-w-xl mx-auto w-full">
                            <div className="flex items-center gap-2.5 mb-4">
                              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ClipboardList className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="min-w-0">
                                <h2 className="text-sm font-bold text-gray-800 truncate">{formAtivo.titulo}</h2>
                                {formAtivo.descricao && (
                                  <p className="text-gray-500 text-xs mt-0.5">{formAtivo.descricao}</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              {perguntasDoForm.map((p, i) => {
                                const resposta = respostas[p.id];
                                return (
                                  <div key={p.id} className="border border-gray-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-700 mb-2.5 flex items-start gap-2">
                                      <span className="text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                                      <span className="flex-1">{p.texto}</span>
                                    </p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setRespostas(prev => ({ ...prev, [p.id]: true }))}
                                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                          resposta === true
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                                        }`}
                                      >
                                        Sim
                                      </button>
                                      <button
                                        onClick={() => setRespostas(prev => ({ ...prev, [p.id]: false }))}
                                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                          resposta === false
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                                        }`}
                                      >
                                        Não
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {totalPerguntas > 0 && (
                              <div className="mt-5 pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
                                <span className="text-xs text-gray-500">
                                  {respondidas} de {totalPerguntas} respondida{totalPerguntas !== 1 ? 's' : ''}
                                </span>
                                {enviandoRespostas && (
                                  <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Enviando...
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : imagesToDisplay.length > 0 ? (
                  <>
                    {/* Visualizador de Imagens */}
                    <div 
                      className="flex-1 flex items-center justify-center overflow-hidden relative bg-gray-100"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {currentImage ? (
                        <>
                          {/* Blur Placeholder - aparece primeiro */}
                          {isImageLoading && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='b' x='0' y='0'%3E%3CfeGaussianBlur stdDeviation='5'/%3E%3C/filter%3E%3Crect width='100' height='100' fill='%23ddd' filter='url(%23b)'/%3E%3C/svg%3E")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              <div className="flex flex-col items-center gap-4 p-6 bg-white/95 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-200">
                                <div className="relative">
                                  <Loader2 className="w-14 h-14 text-red-500 animate-spin" strokeWidth={2.5} />
                                  <div className="absolute inset-0 w-14 h-14 border-3 border-red-200 rounded-full animate-ping opacity-25"></div>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-bold text-gray-800 mb-1">
                                    Carregando...
                                  </p>
                                  {isSlowConnection && (
                                    <p className="text-xs text-amber-600 font-semibold animate-pulse flex items-center gap-1 justify-center">
                                      <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                      Conexão lenta
                                    </p>
                                  )}
                                </div>
                                <div className="w-52 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                  <div className="h-full bg-gradient-to-r from-red-400 via-red-500 to-red-600 animate-progress shadow-lg"></div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Imagem Principal com Progressive Loading */}
                          <img 
                            ref={highResImageRef}
                            src={getAttachmentUrl(currentImage)} 
                            alt={currentImage.nome}
                            className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-700 ease-out ${
                              isImageLoading || !highResLoaded ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
                            }`}
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              width: 'auto',
                              height: 'auto',
                              willChange: 'transform, opacity, filter'
                            }}
                            loading="eager"
                            decoding="async"
                            fetchpriority="high"
                            onError={(e) => {
                              console.error('❌ Erro ao carregar imagem:', e.target.src);
                              if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
                              setIsImageLoading(false);
                              setHighResLoaded(true);
                              setIsSlowConnection(false);
                            }}
                            onLoadStart={() => {
                              // Detecta conexão lenta após 1.5 segundos
                              loadTimeoutRef.current = setTimeout(() => {
                                setIsSlowConnection(true);
                              }, 1500);
                            }}
                            onLoad={() => {
                              console.log('✅ Imagem carregada:', currentImage.nome);
                              if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
                              
                              // Pequeno delay para transição suave
                              setTimeout(() => {
                                setIsImageLoading(false);
                                setHighResLoaded(true);
                                setIsSlowConnection(false);
                              }, 150);
                            }}
                          />
                          
                          {/* Controles do Carrossel */}
                          {imagesToDisplay.length > 1 && (
                            <>
                              {/* Botão Anterior */}
                              <button
                                onClick={isSubmenuMode ? prevSubmenuImage : prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-200"
                                title="Imagem anterior"
                              >
                                <ChevronLeft className="w-6 h-6 text-gray-700" />
                              </button>
                              
                              {/* Botão Próximo */}
                              <button
                                onClick={isSubmenuMode ? nextSubmenuImage : nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-200"
                                title="Próxima imagem"
                              >
                                <ChevronRight className="w-6 h-6 text-gray-700" />
                              </button>
                              
                              {/* Indicadores de posição (dots) */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/90 rounded-full shadow-lg">
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
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      index === currentImageIndex 
                                        ? 'bg-red-500 w-8' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    title={`Imagem ${index + 1} de ${imagesToDisplay.length}`}
                                  />
                                ))}
                              </div>
                              
                              {/* Contador de imagens */}
                              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-sm font-semibold shadow-lg text-gray-800">
                                {currentImageIndex + 1} / {imagesToDisplay.length}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                          <ImageIcon className="w-16 h-16" />
                          <p className="text-lg">Nenhuma imagem disponível</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Galeria de Miniaturas */}
                    {imagesToDisplay.length > 1 && (
                      <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {imagesToDisplay.map((image, index) => (
                            <LazyThumbnail
                              key={image.id || index}
                              src={getAttachmentUrl(image)}
                              alt={image.nome}
                              isActive={index === currentImageIndex}
                              currentIndex={currentImageIndex}
                              index={index}
                              onClick={() => {
                                if (isSubmenuMode) {
                                  selectSubmenuImage(index);
                                } else {
                                  setIsImageLoading(true);
                                  setHighResLoaded(false);
                                  setSelectedAttachmentIndex(index);
                                }
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs mt-2 text-center text-gray-500">
                          {currentImage?.nome} ({currentImageIndex + 1} de {imagesToDisplay.length})
                        </p>
                      </div>
                    )}
                  </>
                ) : otherAttachments.length > 0 ? (
                  <div className="h-full overflow-y-auto p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Anexos disponíveis</h3>
                    <div className="space-y-3">
                      {otherAttachments.map((doc, index) => (
                        <a
                          key={index}
                          href={getAttachmentUrl(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                        >
                          <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{doc.nome}</p>
                            <p className="text-xs text-gray-500">{doc.tipo || 'Arquivo'}</p>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Nenhum anexo disponível para esta trilha</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full text-center">
                <div className="border border-gray-200 rounded-lg p-12 shadow-sm bg-white">
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">
                    Bem-vindo à Trilha de Vendas
                  </h1>
                  <p className="text-gray-600">
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
