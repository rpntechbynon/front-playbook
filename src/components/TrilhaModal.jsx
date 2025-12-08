import React from "react";
import { X, FileText, Plus, Package } from "lucide-react";
import EtapaTreeNode from "./EtapaTreeNode";
import { useTheme } from "../contexts/ThemeContext";

export default function TrilhaModal({ trilha, expandedNodes, onToggleNode, onClose, onAddEtapa, onEditEtapa, onRemoveEtapa, onAddSubmenu, onEditSubmenu, onRemoveSubmenu }) {
	const { theme, isDarkMode } = useTheme();

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
							/>
						))}
						
						{/* Botão para adicionar etapa raiz */}
						<button
							onClick={() => onAddEtapa(trilha.id, null)}
							className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-all group ${isDarkMode ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500/60' : 'bg-gray-100 border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500'}`}
						>
							<Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
							<span className="font-semibold">Adicionar Nova Etapa Principal</span>
						</button>
					</div>

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
