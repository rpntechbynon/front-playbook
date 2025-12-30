import React from "react";
import { ChevronDown, ChevronRight, Image, FileText, Plus, Trash2, Edit, Download, Eye, Paperclip, Menu, Package, CheckSquare, GripVertical } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function EtapaTreeNode({ etapa, level = 0, index = 1, expandedNodes, onToggleNode, onAddChild, onEdit, onRemove, trilhaId, onAddSubmenu, onEditSubmenu, onRemoveSubmenu, isDraggable = false, onUpdateOrder, onReloadTrilhas, setIsUpdating }) {
	const { theme, isDarkMode } = useTheme();
	
	// Hook de drag and drop
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ 
		id: etapa.id,
		disabled: !isDraggable
	});

	const style = isDraggable ? {
		transform: CSS.Transform.toString(transform),
		transition: transition || 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-out',
		opacity: isDragging ? 0.6 : 1,
		scale: isDragging ? '1.02' : '1',
		boxShadow: isDragging ? '0 12px 40px rgba(0, 0, 0, 0.25)' : 'none',
		zIndex: isDragging ? 50 : 'auto',
	} : {};

	// Configurar sensores para sub-etapas
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

	// Handler para drag das sub-etapas
	const handleSubEtapasDragEnd = async (event) => {
		const { active, over } = event;

		if (over && active.id !== over.id && children) {
			// Ativar loading IMEDIATAMENTE
			if (setIsUpdating) {
				setIsUpdating(true);
			}
			
			const oldIndex = children.findIndex((e) => e.id === active.id);
			const newIndex = children.findIndex((e) => e.id === over.id);

			try {
				const newChildren = arrayMove(children, oldIndex, newIndex);
				const etapaMoved = newChildren[newIndex];
				
				if (onUpdateOrder) {
					await onUpdateOrder(etapaMoved.id, newIndex + 1);
					// Recarregar apenas os dados sem fechar o modal
					if (onReloadTrilhas) {
						await onReloadTrilhas();
					}
				}
				
				// Desativar loading
				if (setIsUpdating) {
					setIsUpdating(false);
				}
			} catch (error) {
				if (setIsUpdating) {
					setIsUpdating(false);
				}
				console.error('Erro ao atualizar ordem:', error);
			}
		}
	};
	// Suportar tanto all_children (API) quanto subEtapas (fallback)
	const children = etapa.all_children || etapa.subEtapas || [];
	const hasChildren = children.length > 0;
	const isExpanded = expandedNodes[etapa.id];
	
	// Estado local para controlar expansão dos submenus (começa minimizado)
	const [submenusExpanded, setSubmenusExpanded] = React.useState(false);
	
	// Estado local para controlar expansão dos produtos (começa minimizado)
	const [produtosExpanded, setProdutosExpanded] = React.useState(false);
	


	const getLevelColor = (level) => {
		switch (level) {
			case 0:
				return 'bg-gradient-to-br from-blue-500 to-purple-600';
			case 1:
				return 'bg-gradient-to-br from-purple-500 to-pink-600';
			case 2:
				return 'bg-gradient-to-br from-pink-500 to-red-600';
			default:
				return 'bg-gradient-to-br from-orange-500 to-yellow-600';
		}
	};

	return (
		<div className="mb-2 transition-all duration-300 ease-out" ref={setNodeRef} style={style}>
			<div 
				className={`group rounded-xl p-4 border transition-all duration-300 ease-out ${level > 0 ? 'ml-6' : ''} ${theme.bg.input} ${theme.border.input} ${isDarkMode ? 'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10' : 'hover:border-gray-400 hover:shadow-lg hover:shadow-gray-200/50'} relative`}
				style={{ marginLeft: level > 0 ? `${level * 24}px` : '0' }}
			>
				{/* Handle para arrastar - aparece ao passar o mouse */}
				{isDraggable && (
					<div
						{...attributes}
						{...listeners}
						className={`absolute left-2 top-1/2 -translate-y-1/2 cursor-move p-1.5 rounded-lg transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 transform group-hover:scale-110 shadow-md ${isDarkMode ? 'bg-gradient-to-br from-blue-600/90 to-purple-600/90 hover:from-blue-500/90 hover:to-purple-500/90' : 'bg-gradient-to-br from-blue-500/90 to-purple-500/90 hover:from-blue-400/90 hover:to-purple-400/90'}`}
						title="Arrastar para reordenar"
					>
						<GripVertical className={`w-4 h-4 text-white`} />
					</div>
				)}
				<div className={`flex items-start gap-3 ${isDraggable ? 'ml-6' : ''}`}>
					{/* Botão de expandir se tiver filhos */}
					<button
						onClick={() => hasChildren && onToggleNode(etapa.id)}
						className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-all ${
							hasChildren 
								? (isDarkMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-gray-200 text-gray-700 hover:bg-gray-300') + ' cursor-pointer'
								: `${theme.bg.buttonSecondary} ${theme.text.tertiary} cursor-default`
						}`}
					>
						{hasChildren ? (
							isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
						) : (
							<div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-gray-400'}`} />
						)}
					</button>

					{/* Número da etapa */}
					<div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md ${getLevelColor(level)}`}>
						{index}
					</div>

					{/* Conteúdo */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2 mb-2">
							<div className="flex-1">
								{etapa.titulo && (
									<h4 className={`font-semibold text-sm leading-tight mb-1 ${theme.text.primary}`}>
										{etapa.titulo}
									</h4>
								)}
								{etapa.descricao && (
									<p className={`text-xs leading-relaxed ${etapa.titulo ? theme.text.tertiary : theme.text.primary} ${etapa.titulo ? '' : 'font-semibold'}`}>
										{etapa.descricao}
									</p>
								)}
							</div>
							<div className="flex items-center gap-2">
								{hasChildren && (
									<span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-200 text-gray-700'}`}>
										{children.length} sub
									</span>
								)}
								{etapa.submenus && etapa.submenus.length > 0 && (
									<span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold ${isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-200 text-purple-700'}`}>
										{etapa.submenus.length} menu
									</span>
								)}
								{etapa.produtos && etapa.produtos.length > 0 && (
									<span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold ${isDarkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-200 text-green-700'}`}>
										{etapa.produtos.length} prod
									</span>
								)}
							</div>
						</div>
						
						{/* Anexos */}
						{etapa.anexos && etapa.anexos.length > 0 && (
							<div className="mt-3">
								<div className="flex items-center gap-2 mb-2">
									<Paperclip className={`w-3.5 h-3.5 ${isDarkMode ? 'text-purple-400' : 'text-gray-600'}`} />
									<span className={`text-xs font-semibold ${theme.text.secondary}`}>
										{etapa.anexos.length} {etapa.anexos.length === 1 ? 'Documento' : 'Documentos'}
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{etapa.anexos.map((anexo, i) => {
										const isImage = anexo.tipo?.startsWith('image/') || anexo.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
										const isPDF = anexo.tipo === 'application/pdf' || anexo.nome?.endsWith('.pdf');
										
										return (
											<div key={i} className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer ${theme.bg.input} ${theme.text.secondary} ${theme.border.input} ${isDarkMode ? 'hover:border-blue-500/50' : 'hover:border-gray-400'}`}>
												{isImage ? (
													<Image className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-gray-600'}`} />
												) : isPDF ? (
													<FileText className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
												) : (
													<FileText className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-gray-600'}`} />
												)}
												<span className="truncate max-w-[120px] font-medium">{anexo.nome || anexo}</span>
												<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													{anexo.url && (
														<>
															<a
																href={anexo.url}
																target="_blank"
																rel="noopener noreferrer"
																className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-blue-500/20' : 'hover:bg-blue-200'}`}
																title="Visualizar"
																onClick={(e) => e.stopPropagation()}
															>
																<Eye className={`w-3 h-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
															</a>
															<a
																href={anexo.url}
																download={anexo.nome}
																className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-green-500/20' : 'hover:bg-green-200'}`}
																title="Download"
																onClick={(e) => e.stopPropagation()}
															>
																<Download className={`w-3 h-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
															</a>
														</>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
						
					{/* Submenus */}
					{etapa.submenus && etapa.submenus.length > 0 && (
						<div className="mt-4">
							<div 
								onClick={() => setSubmenusExpanded(!submenusExpanded)}
								className={`flex items-center gap-2 mb-3 pb-2 border-b cursor-pointer hover:opacity-80 transition-opacity ${isDarkMode ? 'border-purple-500/30' : 'border-purple-200'}`}
							>
								<button className={`w-5 h-5 flex items-center justify-center rounded transition-all ${isDarkMode ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
									{submenusExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
								</button>
								<div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
									<Menu className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
								</div>
								<span className={`text-sm font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
									Submenus ({etapa.submenus.length})
								</span>
							</div>
							{submenusExpanded && (
								<div className="space-y-2">
									{etapa.submenus.map((submenu, i) => (
										<div 
											key={submenu.id} 
											className={`group relative rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${
												isDarkMode 
													? 'bg-gradient-to-r from-purple-900/20 via-purple-800/10 to-transparent border-purple-500/30 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20' 
													: 'bg-gradient-to-r from-purple-50 via-purple-25 to-transparent border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-200/50'
											}`}
										>
											{/* Barra lateral colorida */}
											<div className={`absolute left-0 top-0 bottom-0 w-1 ${isDarkMode ? 'bg-gradient-to-b from-purple-400 to-pink-500' : 'bg-gradient-to-b from-purple-500 to-pink-600'}`} />
											
											<div className="pl-4 pr-3 py-3">
												<div className="flex items-start gap-3">
													{/* Ícone e número */}
													<div className="flex-shrink-0 flex items-center gap-2">
														<div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-purple-600/30 text-purple-300' : 'bg-purple-200 text-purple-700'}`}>
															{i + 1}
														</div>
													</div>
													
													{/* Conteúdo */}
													<div className="flex-1 min-w-0">
														<h5 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>
															{submenu.titulo}
														</h5>
														{submenu.descricao && (
															<p className={`text-xs leading-relaxed ${isDarkMode ? 'text-purple-200/70' : 'text-purple-700/70'}`}>
																{submenu.descricao}
															</p>
														)}
														
														{/* Documentos do submenu */}
														{submenu.documentos && submenu.documentos.length > 0 && (
															<div className="mt-2 flex items-center gap-1">
																<Paperclip className={`w-3 h-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
																<span className={`text-[10px] font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
																	{submenu.documentos.length} {submenu.documentos.length === 1 ? 'arquivo' : 'arquivos'}
																</span>
															</div>
														)}
													</div>
													
													{/* Botões de ação */}
													<div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														{onEditSubmenu && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	onEditSubmenu(etapa.id, submenu);
																}}
																className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-100 text-blue-600'}`}
																title="Editar submenu"
															>
																<Edit className="w-3.5 h-3.5" />
															</button>
														)}
														{onRemoveSubmenu && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	onRemoveSubmenu(submenu.id);
																}}
																className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
																title="Remover submenu"
															>
																<Trash2 className="w-3.5 h-3.5" />
															</button>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
					
					{/* Produtos */}
					{etapa.produtos && etapa.produtos.length > 0 && (
						<div className="mt-4">
							<div 
								onClick={() => setProdutosExpanded(!produtosExpanded)}
								className={`flex items-center gap-2 mb-3 pb-2 border-b cursor-pointer hover:opacity-80 transition-opacity ${isDarkMode ? 'border-green-500/30' : 'border-green-200'}`}
							>
								<button className={`w-5 h-5 flex items-center justify-center rounded transition-all ${isDarkMode ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
									{produtosExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
								</button>
								<div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
									<Package className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
								</div>
								<span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
									Produtos ({etapa.produtos.length})
								</span>
							</div>
							{produtosExpanded && (
								<div className="space-y-2">
									{etapa.produtos
										.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
										.map((produto, i) => (
										<div 
											key={produto.id || i} 
											className={`group relative rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${
												isDarkMode 
													? 'bg-gradient-to-r from-green-900/20 via-green-800/10 to-transparent border-green-500/30 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/20' 
													: 'bg-gradient-to-r from-green-50 via-green-25 to-transparent border-green-200 hover:border-green-400 hover:shadow-lg hover:shadow-green-200/50'
											}`}
										>
											{/* Barra lateral colorida */}
											<div className={`absolute left-0 top-0 bottom-0 w-1 ${isDarkMode ? 'bg-gradient-to-b from-green-400 to-emerald-500' : 'bg-gradient-to-b from-green-500 to-emerald-600'}`} />
											
											<div className="pl-4 pr-3 py-3">
												<div className="flex items-start gap-3">
													{/* Ícone e ordem */}
													<div className="flex-shrink-0 flex items-center gap-2">
														<div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-green-600/30 text-green-300' : 'bg-green-200 text-green-700'}`}>
															{produto.ordem || i + 1}
														</div>
													</div>
													
													{/* Conteúdo */}
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<h5 className={`font-bold text-sm ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>
																{produto.nome || 'Produto sem nome'}
															</h5>
															{produto.recomendado == 1 && (
																<div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
																	<CheckSquare className="w-3 h-3" />
																	<span>Recomendado</span>
																</div>
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
					
					{/* Botões de ação */}
					<div className="flex items-center gap-2 mt-2 flex-wrap">
							<button
								onClick={(e) => {
									e.stopPropagation();
									onAddChild && onAddChild(trilhaId, etapa.id);
								}}
								className={`flex items-center gap-1 px-2 py-1 border rounded-md transition-all text-xs font-medium ${isDarkMode ? 'bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30' : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'}`}
								title="Adicionar sub-etapa"
							>
								<Plus className="w-3 h-3" />
								<span>Adicionar</span>
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onAddSubmenu && onAddSubmenu(etapa.id);
								}}
								className={`flex items-center gap-1 px-2 py-1 border rounded-md transition-all text-xs font-medium ${isDarkMode ? 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30' : 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200'}`}
								title="Gerenciar submenus"
							>
								<Menu className="w-3 h-3" />
								<span>Submenu</span>
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onEdit && onEdit(trilhaId, etapa);
								}}
								className={`flex items-center gap-1 px-2 py-1 border rounded-md transition-all text-xs font-medium ${isDarkMode ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'}`}
								title="Editar etapa"
							>
								<Edit className="w-3 h-3" />
								<span>Editar</span>
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onRemove && onRemove(trilhaId, etapa.id);
								}}
								className={`flex items-center gap-1 px-2 py-1 border rounded-md transition-all text-xs font-medium ${isDarkMode ? 'bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30' : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'}`}
								title="Remover etapa"
							>
								<Trash2 className="w-3 h-3" />
								<span>Remover</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Renderizar filhos se expandido */}
			{hasChildren && isExpanded && (
				<div className="mt-2">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleSubEtapasDragEnd}
					>
						<SortableContext
							items={children.map(e => e.id)}
							strategy={verticalListSortingStrategy}
						>
							{children.map((subEtapa, idx) => (
								<EtapaTreeNode
									key={subEtapa.id}
									etapa={subEtapa}
									level={level + 1}
									index={idx + 1}
									expandedNodes={expandedNodes}
									onToggleNode={onToggleNode}
									onAddChild={onAddChild}
									onEdit={onEdit}
									onRemove={onRemove}
									trilhaId={trilhaId}
									onAddSubmenu={onAddSubmenu}
									onEditSubmenu={onEditSubmenu}
									onRemoveSubmenu={onRemoveSubmenu}
									isDraggable={true}
									onUpdateOrder={onUpdateOrder}
									onReloadTrilhas={onReloadTrilhas}
									setIsUpdating={setIsUpdating}
								/>
							))}
						</SortableContext>
					</DndContext>
				</div>
			)}
		</div>
	);
}
