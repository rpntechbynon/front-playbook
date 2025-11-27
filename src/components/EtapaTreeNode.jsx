import React from "react";
import { ChevronDown, ChevronRight, Image, FileText, Plus, Trash2, Edit, Download, Eye, Paperclip } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function EtapaTreeNode({ etapa, level = 0, index = 1, expandedNodes, onToggleNode, onAddChild, onEdit, onRemove, trilhaId }) {
	const { theme, isDarkMode } = useTheme();
	const hasChildren = etapa.subEtapas && etapa.subEtapas.length > 0;
	const isExpanded = expandedNodes[etapa.id];

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
		<div className="mb-2">
			<div 
				className={`rounded-xl p-4 border transition-all ${level > 0 ? 'ml-6' : ''} ${theme.bg.input} ${theme.border.input} ${isDarkMode ? 'hover:border-blue-500/50' : 'hover:border-gray-400'}`}
				style={{ marginLeft: level > 0 ? `${level * 24}px` : '0' }}
			>
				<div className="flex items-start gap-3">
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
							{hasChildren && (
								<span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-200 text-gray-700'}`}>
									{etapa.subEtapas.length} sub
								</span>
							)}
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
					{etapa.subEtapas.map((subEtapa, idx) => (
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
						/>
					))}
				</div>
			)}
		</div>
	);
}
