import React from "react";
import { X, FileText, Plus, Package } from "lucide-react";
import EtapaTreeNode from "./EtapaTreeNode";
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

export default function TrilhaModal({ trilha, expandedNodes, onToggleNode, onClose, onAddEtapa, onEditEtapa, onRemoveEtapa, onAddSubmenu, onEditSubmenu, onRemoveSubmenu, onDeleteDocumento, onDeleteDocumentoSubmenu, onReload }) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEndEtapas = async (event) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const etapas = trilha.etapas || [];
		const oldIndex = etapas.findIndex((e) => e.id === active.id);
		const newIndex = etapas.findIndex((e) => e.id === over.id);

		if (oldIndex === -1 || newIndex === -1) return;

		const reordenadas = arrayMove(etapas, oldIndex, newIndex);

		try {
			const minIndex = Math.min(oldIndex, newIndex);
			const maxIndex = Math.max(oldIndex, newIndex);

			const updatePromises = [];
			for (let i = minIndex; i <= maxIndex; i++) {
				const etapa = reordenadas[i];
				const novaOrdem = i + 1;
				if (etapa.ordem !== novaOrdem) {
					updatePromises.push(
						fetch(`${API_BASE_URL}/decisoes/${etapa.id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ ordem: novaOrdem })
						}).catch(err => {
							console.error(`Erro ao atualizar ordem da etapa ${etapa.id}:`, err);
							throw err;
						})
					);
				}
			}

			if (updatePromises.length > 0) {
				await Promise.all(updatePromises);
				if (onReload) await onReload();
			}
		} catch (error) {
			console.error('Erro ao reordenar etapas:', error);
			alert('Erro ao salvar nova ordem. Tente novamente.');
		}
	};

	if (!trilha) return null;

	return (
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
			<div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-6xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="border-b border-gray-200 p-6 flex items-start justify-between sticky top-0 z-10 bg-gray-50">
					<div className="flex-1">
						<h2 className="text-2xl font-bold mb-2 text-gray-900">{trilha.nome}</h2>
						<div className="flex items-center gap-4 text-sm text-gray-600">
							<span className="flex items-center gap-1">
								<FileText className="w-4 h-4" />
								{trilha.etapas?.length || 0} etapas principais
							</span>
							<span className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
								Visualização em Árvore
							</span>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-lg transition-all bg-gray-200 hover:bg-gray-300 text-gray-600"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Conteúdo */}
				<div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEndEtapas}
					>
						<SortableContext
							items={(trilha.etapas || []).map(e => e.id)}
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
										onDeleteDocumento={onDeleteDocumento}
										onDeleteDocumentoSubmenu={onDeleteDocumentoSubmenu}
										onReload={onReload}
									/>
								))}

								<button
									onClick={() => onAddEtapa(trilha.id, null)}
									className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 transition-all group hover:bg-red-50 hover:border-red-400 hover:text-red-600"
								>
									<Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
									<span className="font-semibold">Adicionar Nova Etapa Principal</span>
								</button>
							</div>
						</SortableContext>
					</DndContext>

					{/* Resumo de Submenus */}
					{(() => {
						const contarSubmenus = (etapas) => {
							let total = 0;
							const processar = (items) => {
								items?.forEach(item => {
									total += item.submenus?.length || 0;
									if (item.subEtapas?.length > 0) processar(item.subEtapas);
									if (item.all_children?.length > 0) processar(item.all_children);
								});
							};
							processar(etapas);
							return total;
						};

						const totalSubmenus = contarSubmenus(trilha.etapas);
						if (totalSubmenus === 0) return null;

						return (
							<div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200">
										<FileText className="w-4 h-4 text-gray-600" />
									</div>
									<div>
										<p className="text-sm font-bold text-gray-700">
											{totalSubmenus} {totalSubmenus === 1 ? 'Submenu Cadastrado' : 'Submenus Cadastrados'}
										</p>
										<p className="text-xs text-gray-500">
											Expanda as etapas acima para visualizar os submenus
										</p>
									</div>
								</div>
							</div>
						);
					})()}

					{/* Resumo de Produtos */}
					{(() => {
						const contarProdutos = (etapas) => {
							let total = 0;
							const processar = (items) => {
								items?.forEach(item => {
									total += item.produtos?.length || 0;
									if (item.subEtapas?.length > 0) processar(item.subEtapas);
									if (item.all_children?.length > 0) processar(item.all_children);
								});
							};
							processar(etapas);
							return total;
						};

						const totalProdutos = contarProdutos(trilha.etapas);
						if (totalProdutos === 0) return null;

						return (
							<div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200">
										<Package className="w-4 h-4 text-gray-600" />
									</div>
									<div>
										<p className="text-sm font-bold text-gray-700">
											{totalProdutos} {totalProdutos === 1 ? 'Produto Cadastrado' : 'Produtos Cadastrados'}
										</p>
										<p className="text-xs text-gray-500">
											Expanda as etapas acima para visualizar os produtos
										</p>
									</div>
								</div>
							</div>
						);
					})()}

					{/* Legenda */}
					<div className="mt-6 pt-6 border-t border-gray-200">
						<p className="text-xs mb-3 font-semibold text-gray-500">Legenda de Níveis:</p>
						<div className="flex flex-wrap gap-3">
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-red-500 rounded-lg"></div>
								<span className="text-xs text-gray-500">Nível 1</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-gray-700 rounded-lg"></div>
								<span className="text-xs text-gray-500">Nível 2</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-gray-500 rounded-lg"></div>
								<span className="text-xs text-gray-500">Nível 3</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 bg-gray-400 rounded-lg"></div>
								<span className="text-xs text-gray-500">Nível 4+</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
