import React, { useState } from "react";
import { X, FileText, Plus, Package, Loader2 } from "lucide-react";
import EtapaTreeNode from "./EtapaTreeNode";
import { useTheme } from "../contexts/ThemeContext";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import API_BASE_URL from "../config/api";

export default function TrilhaModal({ trilha, expandedNodes, onToggleNode, onClose, onAddEtapa, onEditEtapa, onRemoveEtapa, onAddSubmenu, onEditSubmenu, onRemoveSubmenu, onReloadTrilhas }) {
	const { theme, isDarkMode } = useTheme();
	const [mensagemSucesso, setMensagemSucesso] = useState("");
	const [activeId, setActiveId] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);

	// Configurar sensores para drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Função para atualizar ordem da etapa no backend
	const atualizarOrdemEtapa = async (etapaId, novaOrdem) => {
		try {
			const response = await fetch(`${API_BASE_URL}/decisoes/${etapaId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ordem: novaOrdem }),
			});

			if (!response.ok) {
				throw new Error('Erro ao atualizar ordem');
			}
		} catch (error) {
			console.error('Erro ao atualizar ordem:', error);
			throw error;
		}
	};

	// Função para lidar com o início do drag
	const handleDragStart = (event) => {
		setActiveId(event.active.id);
	};

	// Função para lidar com o final do drag das etapas principais
	const handleDragEnd = async (event) => {
		const { active, over } = event;
		setActiveId(null);

		if (over && active.id !== over.id && trilha?.etapas) {
			// Ativar loading IMEDIATAMENTE
			setIsUpdating(true);
			
			const oldIndex = trilha.etapas.findIndex((e) => e.id === active.id);
			const newIndex = trilha.etapas.findIndex((e) => e.id === over.id);

			try {
				// Reordenar localmente
				const newEtapas = arrayMove(trilha.etapas, oldIndex, newIndex);
				
				// Atualizar a ordem da etapa movida
				const etapaMoved = newEtapas[newIndex];
				await atualizarOrdemEtapa(etapaMoved.id, newIndex + 1);
				
				// Recarregar apenas os dados das trilhas sem fechar o modal
				if (onReloadTrilhas) {
					await onReloadTrilhas();
				}
				
				// Desativar loading e mostrar sucesso
				setIsUpdating(false);
				setMensagemSucesso("✓ Ordem atualizada com sucesso!");
				setTimeout(() => setMensagemSucesso(""), 3000);
			} catch (error) {
				setIsUpdating(false);
				console.error('Erro ao atualizar ordem:', error);
				alert('Erro ao atualizar ordem. Tente novamente.');
			}
		}
	};

	// Função para lidar com o cancelamento do drag
	const handleDragCancel = () => {
		setActiveId(null);
	};

	if (!trilha) return null;

	return (
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
			<div className={`rounded-2xl shadow-2xl border max-w-6xl w-full max-h-[85vh] overflow-hidden ${theme.bg.card} ${theme.border.card}`} onClick={(e) => e.stopPropagation()}>
				{/* Header do Modal */}
				<div className={`border-b p-6 flex items-start justify-between sticky top-0 z-10 ${isDarkMode ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-slate-700' : 'bg-gradient-to-r from-gray-200/50 to-gray-100/50 border-gray-300'}`}>
					<div className="flex-1">
						<h2 className={`text-2xl font-bold mb-2 ${theme.text.primary}`}>{trilha.nome}</h2>
						<div className={`flex items-center gap-4 text-sm ${theme.text.tertiary}`}>
							<span className="flex items-center gap-1">
								<FileText className="w-4 h-4" />
								{trilha.etapas?.length || 0} etapas principais
							</span>
							<span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-200 text-gray-700'}`}>
								Visualização em Árvore
							</span>
						</div>
					</div>
				<button
					onClick={onClose}
					className={`p-2 rounded-lg transition-all ${theme.bg.buttonSecondary} ${theme.hover} ${theme.text.secondary}`}
				>
					<X className="w-5 h-5" />
				</button>
			</div>				{/* Conteúdo do Modal - Árvore Expansível */}
				<div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
					{/* Mensagem de Loading - Aparece IMEDIATAMENTE */}
					{isUpdating && (
						<div 
							className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-gradient-to-r from-blue-900/80 to-purple-900/80 border border-blue-500/50 text-blue-200' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300 text-blue-800'} shadow-xl animate-in slide-in-from-top-2 fade-in duration-200`}
							style={{
								animation: 'slideInFromTop 0.2s ease-out'
							}}
						>
							<Loader2 className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} animate-spin`} />
							<div className="flex-1">
								<span className="font-semibold text-sm">Atualizando ordem...</span>
								<p className={`text-xs mt-0.5 ${isDarkMode ? 'text-blue-300/70' : 'text-blue-600/70'}`}>Aguarde enquanto salvamos as alterações</p>
							</div>
							<div className="flex gap-1">
								<div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
								<div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
								<div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
							</div>
						</div>
					)}

					{/* Mensagem de Sucesso */}
					{mensagemSucesso && !isUpdating && (
						<div 
							className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${isDarkMode ? 'bg-gradient-to-r from-green-900/80 to-emerald-900/80 border border-green-500/50 text-green-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 text-green-800'} text-sm shadow-lg animate-in slide-in-from-top-2 fade-in duration-300`}
							style={{
								animation: 'slideInFromTop 0.3s ease-out'
							}}
						>
							<div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'} animate-pulse`}></div>
							<span className="font-medium">{mensagemSucesso}</span>
						</div>
					)}

					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						onDragCancel={handleDragCancel}
					>
						<SortableContext
							items={trilha.etapas?.map(e => e.id) || []}
							strategy={verticalListSortingStrategy}
						>
							<div className="space-y-2">
								{trilha.etapas?.map((etapa, index) => (
									<EtapaTreeNode
										key={etapa.id}
										etapa={etapa}
										level={0}
										index={index + 1}
										expandedNodes={expandedNodes}
										onToggleNode={onToggleNode}
										onAddChild={onAddEtapa}
										onEdit={onEditEtapa}
										onRemove={onRemoveEtapa}
										trilhaId={trilha.id}
										onAddSubmenu={onAddSubmenu}
										onEditSubmenu={onEditSubmenu}
										onRemoveSubmenu={onRemoveSubmenu}
										isDraggable={true}
										onUpdateOrder={atualizarOrdemEtapa}
										onReloadTrilhas={onReloadTrilhas}
										setIsUpdating={setIsUpdating}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
					
					{/* Botão para adicionar etapa raiz */}
					<button
						onClick={() => onAddEtapa(trilha.id, null)}
						className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-all group ${isDarkMode ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500/60' : 'bg-gray-100 border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500'}`}
					>
						<Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
						<span className="font-semibold">Adicionar Nova Etapa Principal</span>
					</button>

					{/* Resumo de Submenus */}
					{(() => {
						const contarSubmenus = (etapas) => {
							let total = 0;
							const processar = (items) => {
								items?.forEach(item => {
									total += item.submenus?.length || 0;
									if (item.subEtapas?.length > 0) {
										processar(item.subEtapas);
									}
									if (item.all_children?.length > 0) {
										processar(item.all_children);
									}
								});
							};
							processar(etapas);
							return total;
						};
						
						const totalSubmenus = contarSubmenus(trilha.etapas);
						
						if (totalSubmenus > 0) {
							return (
								<div className={`mt-6 p-4 rounded-xl border ${isDarkMode ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
									<div className="flex items-center gap-2 mb-2">
										<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-600/30' : 'bg-purple-200'}`}>
											<FileText className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
										</div>
										<div>
											<p className={`text-sm font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
												{totalSubmenus} {totalSubmenus === 1 ? 'Submenu Cadastrado' : 'Submenus Cadastrados'}
											</p>
											<p className={`text-xs ${isDarkMode ? 'text-purple-300/70' : 'text-purple-600/70'}`}>
												Expanda as etapas acima para visualizar os submenus
											</p>
										</div>
									</div>
								</div>
							);
						}
						return null;
					})()}

					{/* Resumo de Produtos */}
					{(() => {
						const contarProdutos = (etapas) => {
							let total = 0;
							const processar = (items) => {
								items?.forEach(item => {
									total += item.produtos?.length || 0;
									if (item.subEtapas?.length > 0) {
										processar(item.subEtapas);
									}
									if (item.all_children?.length > 0) {
										processar(item.all_children);
									}
								});
							};
							processar(etapas);
							return total;
						};
						
						const totalProdutos = contarProdutos(trilha.etapas);
						
						if (totalProdutos > 0) {
							return (
								<div className={`mt-4 p-4 rounded-xl border ${isDarkMode ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
									<div className="flex items-center gap-2 mb-2">
										<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-600/30' : 'bg-green-200'}`}>
											<Package className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
										</div>
										<div>
											<p className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
												{totalProdutos} {totalProdutos === 1 ? 'Produto Cadastrado' : 'Produtos Cadastrados'}
											</p>
											<p className={`text-xs ${isDarkMode ? 'text-green-300/70' : 'text-green-600/70'}`}>
												Expanda as etapas acima para visualizar os produtos
											</p>
										</div>
									</div>
								</div>
							);
						}
						return null;
					})()}

					{/* Legenda */}
					<div className={`mt-6 pt-6 border-t ${theme.border.input}`}>
						<p className={`text-xs mb-3 font-semibold ${theme.text.tertiary}`}>Legenda de Níveis:</p>
						<div className="flex flex-wrap gap-3">
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
								<span className={`text-xs ${theme.text.tertiary}`}>Nível 1</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg"></div>
								<span className={`text-xs ${theme.text.tertiary}`}>Nível 2</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg"></div>
								<span className={`text-xs ${theme.text.tertiary}`}>Nível 3</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg"></div>
								<span className={`text-xs ${theme.text.tertiary}`}>Nível 4+</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
