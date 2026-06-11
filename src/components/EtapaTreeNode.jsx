import React from "react";
import { ChevronDown, ChevronRight, Image, FileText, Plus, Trash2, Edit, Download, Eye, Paperclip, Menu, Package, CheckSquare, GripVertical } from "lucide-react";
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
import API_BASE_URL from "../config/api";

function SortableSubmenu({ submenu, index, onEdit, onRemove, etapaId, onDeleteDocumentoSubmenu }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: submenu.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:shadow-sm hover:border-gray-300 ${isDragging ? 'z-50 cursor-grabbing' : ''}`}
		>
			<div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />

			<div className="pl-4 pr-3 py-3">
				<div className="flex items-start gap-3">
					<div
						{...attributes}
						{...listeners}
						className="cursor-grab active:cursor-grabbing flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
						title="Arrastar para reordenar"
					>
						<GripVertical className="w-4 h-4" />
					</div>

					<div className="flex-shrink-0">
						<div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-gray-100 text-gray-700">
							{index + 1}
						</div>
					</div>

					<div className="flex-1 min-w-0">
						<h5 className="font-bold text-sm mb-1 text-gray-900">{submenu.titulo}</h5>
						{submenu.descricao && (
							<p className="text-xs leading-relaxed text-gray-500">{submenu.descricao}</p>
						)}

						{submenu.documentos && submenu.documentos.length > 0 && (
							<div className="mt-2 space-y-1">
								<div className="flex items-center gap-1">
									<Paperclip className="w-3 h-3 text-gray-400" />
									<span className="text-[10px] font-medium text-gray-600">
										{submenu.documentos.length} {submenu.documentos.length === 1 ? 'arquivo' : 'arquivos'}
									</span>
								</div>
								<div className="flex flex-wrap gap-1 mt-1">
									{submenu.documentos.slice(0, 3).map((doc, idx) => {
										const isImg = doc.tipo?.startsWith('image/');
										return (
											<div key={doc.id || idx} className="group/doc flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-gray-100 text-gray-600">
												{isImg ? <Image className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
												<span className="truncate max-w-[60px]">{doc.nome}</span>
												{doc.id && onDeleteDocumentoSubmenu && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															onDeleteDocumentoSubmenu(submenu.id, doc.id, doc.nome);
														}}
														className="opacity-0 group-hover/doc:opacity-100 transition-opacity hover:text-red-600"
														title="Excluir"
													>
														<Trash2 className="w-2.5 h-2.5" />
													</button>
												)}
											</div>
										);
									})}
									{submenu.documentos.length > 3 && (
										<span className="text-[9px] text-gray-400">+{submenu.documentos.length - 3}</span>
									)}
								</div>
							</div>
						)}
					</div>

					<div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						{onEdit && (
							<button
								onClick={(e) => { e.stopPropagation(); onEdit(etapaId, submenu); }}
								className="p-1.5 rounded-lg transition-all hover:bg-gray-100 text-gray-500"
								title="Editar submenu"
							>
								<Edit className="w-3.5 h-3.5" />
							</button>
						)}
						{onRemove && (
							<button
								onClick={(e) => { e.stopPropagation(); onRemove(submenu.id); }}
								className="p-1.5 rounded-lg transition-all hover:bg-red-50 text-red-500"
								title="Remover submenu"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function EtapaTreeNode({ etapa, level = 0, index = 1, expandedNodes, onToggleNode, onAddChild, onEdit, onRemove, trilhaId, onAddSubmenu, onEditSubmenu, onRemoveSubmenu, onDeleteDocumento, onDeleteDocumentoSubmenu, onReload }) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEndSubmenus = async (event) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const submenus = etapa.submenus || [];
		const oldIndex = submenus.findIndex((s) => s.id === active.id);
		const newIndex = submenus.findIndex((s) => s.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const reordenados = arrayMove(submenus, oldIndex, newIndex);

		try {
			const minIndex = Math.min(oldIndex, newIndex);
			const maxIndex = Math.max(oldIndex, newIndex);
			const updatePromises = [];
			for (let i = minIndex; i <= maxIndex; i++) {
				const submenu = reordenados[i];
				updatePromises.push(
					fetch(`${API_BASE_URL}/submenus/${submenu.id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ordem: i + 1 })
					}).catch(err => { throw err; })
				);
			}
			if (updatePromises.length > 0) {
				await Promise.all(updatePromises);
				if (onReload) await onReload();
			}
		} catch (error) {
			console.error('Erro ao reordenar submenus:', error);
			alert('Erro ao salvar nova ordem. Tente novamente.');
		}
	};

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: etapa.id, disabled: level > 0 });

	const style = level === 0 ? {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	} : {};

	const children = etapa.all_children || etapa.subEtapas || [];
	const hasChildren = children.length > 0;
	const isExpanded = expandedNodes[etapa.id];

	const [submenusExpanded, setSubmenusExpanded] = React.useState(false);
	const [produtosExpanded, setProdutosExpanded] = React.useState(false);

	const getLevelColor = (level) => {
		switch (level) {
			case 0: return 'bg-red-500';
			case 1: return 'bg-gray-700';
			case 2: return 'bg-gray-500';
			default: return 'bg-gray-400';
		}
	};

	return (
		<div
			ref={level === 0 ? setNodeRef : undefined}
			style={style}
			className="mb-2"
		>
			<div
				className={`rounded-lg p-4 border border-gray-200 bg-white transition-all hover:border-red-300 hover:shadow-sm ${isDragging ? 'z-50 cursor-grabbing' : ''}`}
				style={{ marginLeft: level > 0 ? `${level * 24}px` : '0' }}
			>
				<div className="flex items-start gap-3">
					{level === 0 && (
						<div
							{...attributes}
							{...listeners}
							className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
							title="Arrastar para reordenar"
						>
							<GripVertical className="w-5 h-5" />
						</div>
					)}

					<button
						onClick={() => hasChildren && onToggleNode(etapa.id)}
						className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-all ${
							hasChildren
								? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
								: 'bg-gray-100 text-gray-400 cursor-default'
						}`}
					>
						{hasChildren ? (
							isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
						) : (
							<div className="w-2 h-2 rounded-full bg-gray-300" />
						)}
					</button>

					<div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ${getLevelColor(level)}`}>
						{index}
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2 mb-2">
							<div className="flex-1">
								{etapa.titulo && (
									<h4 className="font-semibold text-sm leading-tight mb-1 text-gray-900">
										{etapa.titulo}
									</h4>
								)}
								{etapa.descricao && (
									<p className={`text-xs leading-relaxed ${etapa.titulo ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>
										{etapa.descricao}
									</p>
								)}
							</div>
							<div className="flex items-center gap-1.5">
								{hasChildren && (
									<span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold bg-gray-100 text-gray-600">
										{children.length} sub
									</span>
								)}
								{etapa.submenus && etapa.submenus.length > 0 && (
									<span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold bg-gray-100 text-gray-600">
										{etapa.submenus.length} menu
									</span>
								)}
								{etapa.produtos && etapa.produtos.length > 0 && (
									<span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold bg-gray-100 text-gray-600">
										{etapa.produtos.length} prod
									</span>
								)}
							</div>
						</div>

						{/* Anexos */}
						{etapa.anexos && etapa.anexos.length > 0 && (
							<div className="mt-3">
								<div className="flex items-center gap-2 mb-2">
									<Paperclip className="w-3.5 h-3.5 text-gray-400" />
									<span className="text-xs font-semibold text-gray-600">
										{etapa.anexos.length} {etapa.anexos.length === 1 ? 'Documento' : 'Documentos'}
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{etapa.anexos.map((anexo, i) => {
										const isImage = anexo.tipo?.startsWith('image/') || anexo.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
										const isPDF = anexo.tipo === 'application/pdf' || anexo.nome?.endsWith('.pdf');

										return (
											<div key={i} className="group flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-gray-200 bg-white text-gray-600 transition-all cursor-pointer hover:border-red-300 hover:shadow-sm">
												{isImage ? (
													<Image className="w-4 h-4 flex-shrink-0 text-gray-500" />
												) : isPDF ? (
													<FileText className="w-4 h-4 flex-shrink-0 text-red-500" />
												) : (
													<FileText className="w-4 h-4 flex-shrink-0 text-gray-500" />
												)}
												<span className="truncate max-w-[120px] font-medium">{anexo.nome || anexo}</span>
												<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													{anexo.url && (
														<>
															<a
																href={anexo.url}
																target="_blank"
																rel="noopener noreferrer"
																className="p-1 rounded transition-colors hover:bg-gray-100"
																title="Visualizar"
																onClick={(e) => e.stopPropagation()}
															>
																<Eye className="w-3 h-3 text-gray-500" />
															</a>
															<a
																href={anexo.url}
																download={anexo.nome}
																className="p-1 rounded transition-colors hover:bg-gray-100"
																title="Download"
																onClick={(e) => e.stopPropagation()}
															>
																<Download className="w-3 h-3 text-gray-500" />
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
									className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
								>
									<button className="w-5 h-5 flex items-center justify-center rounded transition-all bg-gray-100 text-gray-600 hover:bg-gray-200">
										{submenusExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
									</button>
									<div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-100">
										<Menu className="w-4 h-4 text-gray-500" />
									</div>
									<span className="text-sm font-bold text-gray-700">
										Submenus ({etapa.submenus.length})
									</span>
								</div>
								{submenusExpanded && (
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleDragEndSubmenus}
									>
										<SortableContext
											items={etapa.submenus.map(s => s.id)}
											strategy={verticalListSortingStrategy}
										>
											<div className="space-y-2">
												{etapa.submenus.map((submenu, i) => (
													<SortableSubmenu
														key={submenu.id}
														submenu={submenu}
														index={i}
														onEdit={onEditSubmenu}
														onRemove={onRemoveSubmenu}
														etapaId={etapa.id}
														onDeleteDocumentoSubmenu={onDeleteDocumentoSubmenu}
													/>
												))}
											</div>
										</SortableContext>
									</DndContext>
								)}
							</div>
						)}

						{/* Produtos */}
						{etapa.produtos && etapa.produtos.length > 0 && (
							<div className="mt-4">
								<div
									onClick={() => setProdutosExpanded(!produtosExpanded)}
									className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
								>
									<button className="w-5 h-5 flex items-center justify-center rounded transition-all bg-gray-100 text-gray-600 hover:bg-gray-200">
										{produtosExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
									</button>
									<div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-100">
										<Package className="w-4 h-4 text-gray-500" />
									</div>
									<span className="text-sm font-bold text-gray-700">
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
												className="relative bg-white rounded-lg border border-gray-200 overflow-hidden"
											>
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
												<div className="pl-4 pr-3 py-3">
													<div className="flex items-center gap-3">
														<div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-gray-100 text-gray-700 flex-shrink-0">
															{produto.ordem || i + 1}
														</div>
														<div className="flex items-center gap-2 flex-1 min-w-0">
															<h5 className="font-bold text-sm text-gray-900">
																{produto.nome || 'Produto sem nome'}
															</h5>
															{produto.recomendado == 1 && (
																<div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
																	<CheckSquare className="w-3 h-3" />
																	<span>Recomendado</span>
																</div>
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

						{/* Botões de ação */}
						<div className="flex items-center gap-2 mt-3 flex-wrap">
							<button
								onClick={(e) => { e.stopPropagation(); onAddChild && onAddChild(trilhaId, etapa.id); }}
								className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md transition-all text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
								title="Adicionar sub-etapa"
							>
								<Plus className="w-3 h-3" />
								<span>Adicionar</span>
							</button>
							<button
								onClick={(e) => { e.stopPropagation(); onAddSubmenu && onAddSubmenu(etapa.id); }}
								className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md transition-all text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
								title="Gerenciar submenus"
							>
								<Menu className="w-3 h-3" />
								<span>Submenu</span>
							</button>
							<button
								onClick={(e) => { e.stopPropagation(); onEdit && onEdit(trilhaId, etapa); }}
								className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md transition-all text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
								title="Editar etapa"
							>
								<Edit className="w-3 h-3" />
								<span>Editar</span>
							</button>
							<button
								onClick={(e) => { e.stopPropagation(); onRemove && onRemove(trilhaId, etapa.id); }}
								className="flex items-center gap-1 px-2 py-1 border border-red-200 rounded-md transition-all text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
								title="Remover etapa"
							>
								<Trash2 className="w-3 h-3" />
								<span>Remover</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			{hasChildren && isExpanded && (
				<div className="mt-2">
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
							onDeleteDocumento={onDeleteDocumento}
							onDeleteDocumentoSubmenu={onDeleteDocumentoSubmenu}
							onReload={onReload}
						/>
					))}
				</div>
			)}
		</div>
	);
}
