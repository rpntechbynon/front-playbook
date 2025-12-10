import React, { useState, useRef } from "react";
import MenuSuperior from "../MenuSuperior";
import MenuLateral from "../../components/Menulateral";
import MenuDireito from "../../components/MenuDireito";
import { FileText, Image as ImageIcon, Download } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import API_BASE_URL from "../../config/api";

export default function Trilha() {
  const { theme, isDarkMode } = useTheme();
  const [selectedTrilha, setSelectedTrilha] = useState(null);
  const [isMenuDireitoMinimized, setIsMenuDireitoMinimized] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [selectedSubmenuDocument, setSelectedSubmenuDocument] = useState(null);
  const menuLateralRef = useRef();

  const handleSelectTrilha = (trilha) => {
    setSelectedTrilha(trilha);
    setSelectedAttachmentIndex(0); // Resetar para o primeiro anexo
    setSelectedSubmenuDocument(null); // Limpar documento selecionado do submenu
    // Expandir o menu direito se houver go_to
    if (trilha?.go_to) {
      setIsMenuDireitoMinimized(false);
    }
  };

  const handleSelectDestination = (destination) => {
    // Quando selecionar um destino no menu direito, atualiza a trilha selecionada
    setSelectedTrilha(destination);
    setSelectedSubmenuDocument(null); // Limpar documento selecionado do submenu
    // Seleciona a trilha no menu lateral
    if (menuLateralRef.current) {
      menuLateralRef.current.selectTrilha(destination.id);
    }
  };

  const handleSelectSubmenuDocument = (document) => {
    setSelectedSubmenuDocument(document);
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

  // Coletar apenas documentos da etapa principal (sem submenus)
  const getAllDocuments = () => {
    if (!selectedTrilha) return [];
    
    let allDocs = [];
    
    // Adicionar apenas documentos da etapa principal
    if (selectedTrilha.documentos && selectedTrilha.documentos.length > 0) {
      allDocs = [...selectedTrilha.documentos];
    }
    
    return allDocs;
  };
  
  // Função auxiliar para coletar documentos incluindo submenus (usado para navegação do visualizador)
  const getAllDocumentsIncludingSubmenus = () => {
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
  };

  // Verificar se tem documentos e separar por tipo
  // Para a lista: apenas documentos da etapa principal
  const allDocuments = getAllDocuments();
  const hasAttachments = allDocuments.length > 0;
  const imageAttachments = hasAttachments 
    ? allDocuments.filter(doc => 
        doc.tipo?.startsWith('image/') || doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      )
    : [];
  const pdfAttachments = hasAttachments
    ? allDocuments.filter(doc => 
        doc.tipo === 'application/pdf' || doc.nome?.match(/\.pdf$/i)
      )
    : [];
  const otherAttachments = hasAttachments
    ? allDocuments.filter(doc => 
        !(doc.tipo?.startsWith('image/') || doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) &&
        !(doc.tipo === 'application/pdf' || doc.nome?.match(/\.pdf$/i))
      )
    : [];
  
  // Para o visualizador: incluir documentos dos submenus para permitir visualização
  const allDocumentsForViewer = getAllDocumentsIncludingSubmenus();
  const viewableAttachments = allDocumentsForViewer.filter(doc => 
    doc.tipo?.startsWith('image/') || 
    doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
    doc.tipo === 'application/pdf' || 
    doc.nome?.match(/\.pdf$/i)
  );
  const currentAttachment = viewableAttachments[selectedAttachmentIndex];
  
  // Verificar se o documento atual pertence a um submenu
  const isCurrentAttachmentFromSubmenu = () => {
    if (!selectedTrilha || !currentAttachment) return false;
    
    // Verificar se o documento está em algum submenu
    if (selectedTrilha.submenus && selectedTrilha.submenus.length > 0) {
      return selectedTrilha.submenus.some(submenu => 
        submenu.documentos?.some(doc => doc.id === currentAttachment.id)
      );
    }
    return false;
  };
  
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
          isMinimized={isMenuDireitoMinimized}
          onToggleMinimize={() => setIsMenuDireitoMinimized(!isMenuDireitoMinimized)}
        />

        {/* Área de Conteúdo Principal */}
        <main className="h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
          {selectedTrilha ? (
            <>
              

              {/* Área de Anexos */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {viewableAttachments.length > 0 ? (
                  <>
                    {/* Visualizador - Só mostrar se não for documento de submenu OU se foi clicado explicitamente */}
                    <div className={`flex-1 flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-100'}`}>
                      {(selectedSubmenuDocument || !isCurrentAttachmentFromSubmenu()) && currentAttachment ? (
                        currentAttachment?.tipo?.startsWith('image/') || currentAttachment?.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img 
                            src={getAttachmentUrl(currentAttachment)} 
                            alt={currentAttachment.nome}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error('Erro ao carregar imagem:', e.target.src);
                              console.error('Documento:', currentAttachment);
                            }}
                            onLoad={() => {
                              console.log('Imagem carregada com sucesso:', getAttachmentUrl(currentAttachment));
                            }}
                          />
                        ) : currentAttachment?.tipo === 'application/pdf' || currentAttachment?.nome?.match(/\.pdf$/i) ? (
                          <iframe
                            src={getAttachmentUrl(currentAttachment)}
                            className="w-full h-full border-0"
                            title={currentAttachment.nome}
                          />
                        ) : null
                      ) : (
                        <div className={`flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <p className="text-lg">Clique em um card de submenu para visualizar</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Galeria de Miniaturas - Ocultar quando exibindo documento de submenu */}
                    {viewableAttachments.length > 1 && !selectedSubmenuDocument && !isCurrentAttachmentFromSubmenu() && (
                      <div className={`border-t p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {viewableAttachments.map((attachment, index) => {
                            const isImage = attachment.tipo?.startsWith('image/') || attachment.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            const isPdf = attachment.tipo === 'application/pdf' || attachment.nome?.match(/\.pdf$/i);
                            const isActive = index === selectedAttachmentIndex;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => setSelectedAttachmentIndex(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  isActive 
                                    ? (isDarkMode ? 'border-blue-500 ring-2 ring-blue-400/50' : 'border-gray-700 ring-2 ring-gray-400') + ' scale-105'
                                    : isDarkMode ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {isImage ? (
                                  <img 
                                    src={getAttachmentUrl(attachment)} 
                                    alt={attachment.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : isPdf ? (
                                  <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                    <FileText className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                                  </div>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                        <p className={`text-xs mt-2 text-center ${theme.text.tertiary}`}>
                          {currentAttachment?.nome} ({selectedAttachmentIndex + 1} de {viewableAttachments.length})
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
