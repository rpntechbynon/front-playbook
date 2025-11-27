import React from "react";
import { Edit, Trash2, Maximize2, FileText, Image } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function TrilhaCard({ trilha, onViewTree, onEdit, onDelete }) {
	const { theme, isDarkMode } = useTheme();

	return (
		<div className={`group rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${theme.bg.card} ${theme.border.card}`}>
			{/* Header do Card */}
			<div className={`border-b p-4 ${isDarkMode ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-slate-700' : 'bg-gradient-to-r from-gray-200 to-gray-100 border-gray-300'}`}>
				<div className="flex items-start justify-between mb-2">
					<div className="flex-1">
						<h3 className={`text-lg font-bold mb-1 line-clamp-2 ${theme.text.primary}`}>{trilha.nome}</h3>
						<div className={`flex items-center gap-3 text-xs ${theme.text.tertiary}`}>
							<span className="flex items-center gap-1">
								<FileText className="w-3 h-3" />
								{trilha.etapas?.length || 0} etapas
							</span>
							<span className="flex items-center gap-1">
								<Image className="w-3 h-3" />
								{trilha.etapas?.reduce((acc, e) => acc + (e.anexos?.length || 0), 0) || 0} anexos
							</span>
						</div>
					</div>
					<div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
						<span className="text-white font-black text-lg">{trilha.etapas?.length || 0}</span>
					</div>
				</div>
			</div>

			{/* Preview das Etapas */}
			<div className="p-4">
				<div className="space-y-2 mb-4">
					{(trilha.etapas || []).slice(0, 2).map((etapa, index) => (
						<div key={etapa.id} className="flex items-start gap-2 text-sm">
							<div className={`w-6 h-6 border rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400' : 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500'}`}>
								{index + 1}
							</div>
							<div className="flex-1 min-w-0">
								<span className={`block truncate font-medium ${theme.text.primary}`}>{etapa.titulo}</span>
								{etapa.subEtapas && etapa.subEtapas.length > 0 && (
									<span className={`text-xs ${theme.text.tertiary}`}>↳ {etapa.subEtapas.length} sub-etapas</span>
								)}
							</div>
						</div>
					))}
					{(trilha.etapas?.length || 0) > 2 && (
						<p className={`text-xs pl-8 ${theme.text.tertiary}`}>+ {trilha.etapas.length - 2} etapas</p>
					)}
				</div>

				{/* Ações */}
				<div className={`flex gap-2 pt-3 border-t ${theme.border.card}`}>
					<button
						onClick={() => onViewTree(trilha.id)}
						className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-all text-sm font-medium ${isDarkMode ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30' : 'bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300'}`}
					>
						<Maximize2 className="w-4 h-4" />
						Ver Árvore
					</button>
					<button 
						onClick={() => onEdit(trilha.id)}
						className={`p-2 border rounded-lg transition-all ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-gray-200 border-gray-300 hover:bg-gray-300'} ${theme.text.secondary}`}
					>
						<Edit className="w-4 h-4" />
					</button>
					<button
						onClick={() => onDelete(trilha.id)}
						className={`p-2 border rounded-lg transition-all ${isDarkMode ? 'bg-red-900/20 border-red-600/30 text-red-400 hover:bg-red-900/30' : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'}`}
					>
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
