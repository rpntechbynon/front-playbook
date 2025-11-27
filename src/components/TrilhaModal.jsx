import React from "react";
import { X, FileText, Plus } from "lucide-react";
import EtapaTreeNode from "./EtapaTreeNode";
import { useTheme } from "../contexts/ThemeContext";

export default function TrilhaModal({ trilha, expandedNodes, onToggleNode, onClose, onAddEtapa, onEditEtapa, onRemoveEtapa }) {
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
