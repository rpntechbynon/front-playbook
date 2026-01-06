import React, { useState } from "react";
import { Edit, Trash2, Maximize2, FileText, Image, Menu, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function TrilhaCard({ trilha, onViewTree, onEdit, onDelete, onAddSubmenu, onEditSubmenu, onRemoveSubmenu }) {
	const { theme, isDarkMode } = useTheme();
	const [showSubmenus, setShowSubmenus] = useState(false);
	
	// Buscar submenus diretos da trilha (filhos do primeiro nível)
	const submenusDirectos = trilha.submenus || [];

	return (
		<div className={`group rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-[600px] flex flex-col ${theme.bg.card} ${theme.border.card}`}>
			{/* Header do Card */}
			<div className={`border-b p-4 flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-slate-700' : 'bg-gradient-to-r from-gray-200 to-gray-100 border-gray-300'}`}>
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
							return totalSubmenus > 0 ? (
								<span className={`flex items-center gap-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-semibold`}>
									<Menu className="w-3 h-3" />
									{totalSubmenus} {totalSubmenus === 1 ? 'submenu' : 'submenus'}
								</span>
							) : null;
						})()}
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
							return totalProdutos > 0 ? (
								<span className={`flex items-center gap-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>
									<Package className="w-3 h-3" />
									{totalProdutos} {totalProdutos === 1 ? 'produto' : 'produtos'}
								</span>
							) : null;
						})()}
					</div>
					</div>
					<div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
						<span className="text-white font-black text-lg">{trilha.etapas?.length || 0}</span>
					</div>
				</div>
			</div>

			{/* Preview das Etapas */}
			<div className="p-4 flex-1 overflow-y-auto flex flex-col">
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

				{/* Seção de Submenus da Trilha */}
				{submenusDirectos.length > 0 && (
					<div className={`mt-4 pt-4 border-t ${theme.border.card}`}>
						<button
							onClick={() => setShowSubmenus(!showSubmenus)}
							className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm font-medium ${isDarkMode ? 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'}`}
						>
							<span className="flex items-center gap-2">
								<Menu className="w-4 h-4" />
								{submenusDirectos.length} {submenusDirectos.length === 1 ? 'Submenu da Trilha' : 'Submenus da Trilha'}
							</span>
							{showSubmenus ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
						</button>

						{showSubmenus && (
							<div className="mt-3 space-y-2">
								{submenusDirectos.map((submenu, index) => (
									<div 
										key={submenu.id} 
										className={`flex items-start gap-2 p-3 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
									>
										<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDarkMode ? 'bg-purple-600/30 text-purple-300' : 'bg-purple-200 text-purple-700'}`}>
											{index + 1}
										</div>
										<div className="flex-1 min-w-0">
											<h4 className={`font-semibold text-sm mb-1 ${theme.text.primary}`}>{submenu.titulo}</h4>
											{submenu.descricao && (
												<p className={`text-xs line-clamp-2 ${theme.text.tertiary}`}>{submenu.descricao}</p>
											)}
											<div className={`flex items-center gap-3 mt-2 text-xs ${theme.text.tertiary}`}>
												{submenu.anexos && submenu.anexos.length > 0 && (
													<span className="flex items-center gap-1">
														<Image className="w-3 h-3" />
														{submenu.anexos.length}
													</span>
												)}
												{submenu.produtos && submenu.produtos.length > 0 && (
													<span className="flex items-center gap-1">
														<Package className="w-3 h-3" />
														{submenu.produtos.length}
													</span>
												)}
											</div>
										</div>
										<div className="flex flex-col gap-1">
											<button
												onClick={() => onEditSubmenu && onEditSubmenu(trilha.id, submenu)}
												className={`p-1.5 rounded transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-600'}`}
												title="Editar submenu"
											>
												<Edit className="w-3.5 h-3.5" />
											</button>
											<button
												onClick={() => onRemoveSubmenu && onRemoveSubmenu(submenu.id)}
												className={`p-1.5 rounded transition-all ${isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
												title="Excluir submenu"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

			{/* Ações */}
			<div className={`flex flex-col gap-2 pt-3 border-t flex-shrink-0 ${theme.border.card}`}>
				<button
					onClick={() => onViewTree(trilha.id)}
					className={`w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-all text-sm font-medium ${isDarkMode ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30' : 'bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300'}`}
				>
					<Maximize2 className="w-4 h-4" />
					Ver Árvore
				</button>
				<div className="flex gap-2">
					<button 
						onClick={() => onAddSubmenu && onAddSubmenu(trilha.id)}
						className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 border rounded-lg transition-all text-xs font-medium ${isDarkMode ? 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30' : 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200'}`}
						title="Adicionar submenu"
					>
						<Menu className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">Submenu</span>
					</button>
					<button 
						onClick={() => onEdit(trilha.id)}
						className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 border rounded-lg transition-all text-xs font-medium ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300' : 'bg-gray-200 border-gray-300 hover:bg-gray-300'} ${theme.text.secondary}`}
						title="Editar trilha"
					>
						<Edit className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">Editar</span>
					</button>
					<button
						onClick={() => onDelete(trilha.id)}
						className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 border rounded-lg transition-all text-xs font-medium ${isDarkMode ? 'bg-red-900/20 border-red-600/30 text-red-400 hover:bg-red-900/30' : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'}`}
						title="Excluir trilha"
					>
						<Trash2 className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">Excluir</span>
					</button>
				</div>
			</div>
		</div>
	</div>
);
}