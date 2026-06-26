import React from "react";
import { Plus, Upload, X, Image, FileText, CheckSquare, Square, AlertCircle, Hash, Maximize2, Trash2, Loader2, ClipboardList } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function TrilhaForm({
	titulo,
	setTitulo,
	descricao,
	setDescricao,
	ordem,
	setOrdem,
	arquivos = [],
	setArquivos,
	goToSelecionados,
	setGoToSelecionados,
	decisoesDisponiveis = [],
	loadingDecisoes = false,
	formulariosSelecionados = [],
	setFormulariosSelecionados,
	formulariosDisponiveis = [],
	loadingFormularios = false,
	onSave,
	onCancel,
	isEditing = false,
	isSaving = false,
	errosArquivos = [],
	onDeleteDocumento
}) {
	const { theme, isDarkMode } = useTheme();
	
	const toggleDecisao = (id) => {
		if (goToSelecionados.includes(id)) {
			setGoToSelecionados(goToSelecionados.filter(decId => decId !== id));
		} else {
			setGoToSelecionados([...goToSelecionados, id]);
		}
	};

	const handleFileUpload = (e) => {
		const files = Array.from(e.target.files);
		setArquivos([...arquivos, ...files]);
		e.target.value = ''; // Limpar input
	};

	const removerArquivo = (index) => {
		setArquivos(arquivos.filter((_, i) => i !== index));
	};

	return (
		<div className={`rounded-2xl shadow-lg p-6 sm:p-8 border mb-8 ${theme.bg.card} ${theme.border.card}`}>
			<h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${theme.text.primary}`}>
				<Plus className={`w-6 h-6 ${theme.icon.default}`} />
				{isEditing ? "Editar Trilha de Vendas" : "Nova Trilha de Vendas"}
			</h2>

			<div className="mb-6">
				<label className={`block font-semibold mb-2 ${theme.text.secondary}`}>Título da Trilha</label>
				<input
					type="text"
					value={titulo}
					onChange={(e) => setTitulo(e.target.value)}
					placeholder="Ex: Oportunidades, Suporte ao Cliente, etc."
					className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'}`}
					autoFocus
				/>
			</div>

			<div className="mb-6">
				<label className={`block font-semibold mb-2 ${theme.text.secondary} flex items-center gap-2`}>
					<Hash className="w-4 h-4" />
					Ordem da Decisão
				</label>
				<p className={`text-xs mb-2 ${theme.text.tertiary}`}>
					Defina a ordem de exibição desta decisão (ex: 1, 2, 3...)
				</p>
				<input
					type="number"
					min="1"
					value={ordem || ""}
					onChange={(e) => {
						const valor = e.target.value ? parseInt(e.target.value) : null;

						setOrdem(valor);
					}}
					placeholder="Ex: 1"
					className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'}`}
				/>
			</div>

		<div className="mb-6">
			<label className={`block font-semibold mb-2 ${theme.text.secondary}`}>Descrição</label>
			<textarea
				value={descricao || ""}
				onChange={(e) => setDescricao(e.target.value)}
				placeholder="Descreva o objetivo e contexto desta trilha..."
				rows={4}
				className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'}`}
			/>
		</div>			{/* Seletor de Go To (Decisões) */}
			<div className="mb-6">
				<label className={`block font-semibold mb-2 flex items-center gap-2 ${theme.text.secondary}`}>
					<CheckSquare className="w-4 h-4" />
					Go To - Próximas Decisões (opcional)
				</label>
				<p className={`text-xs mb-3 ${theme.text.tertiary}`}>
					Selecione as decisões para onde esta trilha pode direcionar
				</p>
				
				{loadingDecisoes ? (
					<div className={`p-4 border rounded-xl ${theme.bg.input} ${theme.border.input} text-center`}>
						<p className={`text-sm ${theme.text.tertiary}`}>Carregando decisões...</p>
					</div>
				) : decisoesDisponiveis && decisoesDisponiveis.length > 0 ? (
					<div className={`border rounded-xl ${theme.bg.input} ${theme.border.input} max-h-48 overflow-y-auto`}>
						{decisoesDisponiveis.map((decisao) => (
							<div
								key={decisao.id}
								onClick={() => toggleDecisao(decisao.id)}
								className={`p-3 border-b last:border-b-0 cursor-pointer transition-all ${
									isDarkMode 
										? 'border-slate-700 hover:bg-slate-700/30' 
										: 'border-gray-200 hover:bg-gray-100'
								} ${
									goToSelecionados.includes(decisao.id) 
										? isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50' 
										: ''
								}`}
							>
								<div className="flex items-start gap-3">
									<div className="pt-0.5">
										{goToSelecionados.includes(decisao.id) ? (
											<CheckSquare className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
										) : (
											<Square className={`w-5 h-5 ${theme.text.tertiary}`} />
										)}
									</div>
									<div className="flex-1">
										<p className={`font-medium text-sm ${theme.text.primary}`}>
											{decisao.titulo}
										</p>
										{decisao.descricao && (
											<p className={`text-xs mt-1 ${theme.text.tertiary}`}>
												{decisao.descricao}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className={`p-4 border rounded-xl ${theme.bg.input} ${theme.border.input} text-center`}>
						<p className={`text-sm ${theme.text.tertiary}`}>Nenhuma decisão disponível</p>
					</div>
				)}
				
				{goToSelecionados.length > 0 && (
					<p className={`text-xs mt-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
						{goToSelecionados.length} decisão(ões) selecionada(s)
					</p>
				)}
			</div>

			{/* Formulários */}
			{setFormulariosSelecionados && (
				<div className="mb-6">
					<label className={`block font-semibold mb-2 flex items-center gap-2 ${theme.text.secondary}`}>
						<ClipboardList className="w-4 h-4" />
						Formulários (opcional)
					</label>
					<p className={`text-xs mb-3 ${theme.text.tertiary}`}>
						Associe formulários de Sim/Não a esta decisão
					</p>

					{formulariosSelecionados.length > 0 && (
						<div className="mb-2 space-y-1">
							{formulariosSelecionados.map((formId) => {
								const form = formulariosDisponiveis.find(f => f.id === formId);
								return (
									<div key={formId} className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
										<span className={`font-semibold truncate flex-1 ${theme.text.primary}`}>{form?.titulo || `Formulário #${formId}`}</span>
										<button
											type="button"
											onClick={() => setFormulariosSelecionados(formulariosSelecionados.filter(id => id !== formId))}
											className={`p-1 rounded flex-shrink-0 ${isDarkMode ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
											disabled={isSaving}
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								);
							})}
						</div>
					)}

					<select
						value=""
						onChange={(e) => {
							if (e.target.value) {
								setFormulariosSelecionados([...formulariosSelecionados, parseInt(e.target.value)]);
							}
						}}
						className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'}`}
						disabled={isSaving || loadingFormularios}
					>
						<option value="">+ Adicionar formulário</option>
						{formulariosDisponiveis
							.filter(f => !formulariosSelecionados.includes(f.id))
							.map((form) => (
								<option key={form.id} value={form.id}>
									{form.titulo}{form.descricao ? ` — ${form.descricao}` : ''}
								</option>
							))}
					</select>

					{formulariosSelecionados.length > 0 && (
						<p className={`text-xs mt-2 font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
							{formulariosSelecionados.length} formulário(s) associado(s)
						</p>
					)}
				</div>
			)}

			{/* Seção Destacada: Documentos Existentes */}
			{isEditing && arquivos.filter(a => !(a instanceof File)).length > 0 && (
				<div className={`mb-6 p-4 rounded-xl border-2 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-blue-500/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400'} shadow-lg`}>
					<div className="flex items-center gap-2 mb-4">
						<div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-600/30' : 'bg-blue-200'}`}>
							<FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`} />
						</div>
						<div className="flex-1">
							<h4 className={`font-bold text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
								📁 Documentos da Trilha
							</h4>
							<p className={`text-xs ${isDarkMode ? 'text-blue-300/70' : 'text-blue-600/70'}`}>
								{arquivos.filter(a => !(a instanceof File)).length} documento(s) anexado(s)
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{arquivos
							.filter(a => !(a instanceof File))
							.map((doc, idx) => {
								const isImage = doc.tipo?.startsWith('image/') || doc.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
								const imageUrl = isImage && (doc.url || doc.url_presignada);
								
								return (
									<div key={doc.id || idx} className={`relative border-2 rounded-xl p-3 transition-all ${isDarkMode ? 'bg-slate-800/80 border-slate-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20' : 'bg-white border-gray-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-300/30'}`}>
										{isImage && imageUrl ? (
											<div className="space-y-3">
												<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5 group">
													<img
														src={imageUrl}
														alt={doc.nome}
														className="w-full h-full object-cover transition-transform group-hover:scale-105"
														onError={(e) => {
															console.error('Erro ao carregar imagem:', doc.nome, imageUrl);
															e.target.style.display = 'none';
														}}
													/>
												</div>
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<Image className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
														<span className={`text-xs font-medium truncate ${theme.text.primary}`} title={doc.nome}>
															{doc.nome}
														</span>
													</div>
													{doc.created_at && (
														<p className={`text-[10px] ${theme.text.tertiary}`}>
															📅 {new Date(doc.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
														</p>
													)}
													<div className="flex gap-2 pt-1">
														<a
															href={imageUrl}
															target="_blank"
															rel="noopener noreferrer"
															className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-center transition-all ${isDarkMode ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50' : 'bg-blue-500 text-white hover:bg-blue-600'} flex items-center justify-center gap-1`}
														>
															<Maximize2 className="w-3 h-3" />
															Abrir
														</a>
														{onDeleteDocumento && (
															<button
																type="button"
																onClick={(e) => {
																	e.preventDefault();
																	onDeleteDocumento(doc.id, doc.nome);
																}}
																className={`px-3 py-2 rounded-lg transition-all ${isDarkMode ? 'bg-red-600/30 text-red-300 hover:bg-red-600/50' : 'bg-red-500 text-white hover:bg-red-600'}`}
																title="Excluir documento"
															>
																<Trash2 className="w-3 h-3" />
															</button>
														)}
													</div>
												</div>
											</div>
										) : (
											<div className="space-y-3">
												<div className={`w-full p-8 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'} flex items-center justify-center`}>
													<FileText className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
												</div>
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<FileText className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
														<span className={`text-xs font-medium truncate flex-1 ${theme.text.primary}`} title={doc.nome}>
															{doc.nome}
														</span>
													</div>
													{doc.created_at && (
														<p className={`text-[10px] ${theme.text.tertiary}`}>
															📅 {new Date(doc.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
														</p>
													)}
													<div className="flex gap-2 pt-1">
														{(doc.url || doc.url_presignada) && (
															<a
																href={doc.url || doc.url_presignada}
																target="_blank"
																rel="noopener noreferrer"
																className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-center transition-all ${isDarkMode ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50' : 'bg-blue-500 text-white hover:bg-blue-600'} flex items-center justify-center gap-1`}
															>
																<Maximize2 className="w-3 h-3" />
																Baixar
															</a>
														)}
														{onDeleteDocumento && (
															<button
																type="button"
																onClick={(e) => {
																	e.preventDefault();
																	onDeleteDocumento(doc.id, doc.nome);
																}}
																className={`px-3 py-2 rounded-lg transition-all ${isDarkMode ? 'bg-red-600/30 text-red-300 hover:bg-red-600/50' : 'bg-red-500 text-white hover:bg-red-600'}`}
																title="Excluir documento"
															>
																<Trash2 className="w-3 h-3" />
															</button>
														)}
													</div>
												</div>
											</div>
										)}
									</div>
								);
							})}
					</div>
				</div>
			)}

			<div className="mb-6">
				<label className={`block font-semibold mb-2 flex items-center gap-2 ${theme.text.secondary}`}>
					<Upload className="w-4 h-4" />
					{isEditing && arquivos.filter(a => !(a instanceof File)).length > 0 ? 'Adicionar Novos Anexos' : 'Anexos (opcional)'}
				</label>
				<input
					type="file"
					multiple
					accept="image/*,.pdf,.doc,.docx"
					onChange={handleFileUpload}
					className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${theme.bg.input} ${theme.border.input} ${theme.text.secondary} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50 file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30' : 'focus:border-gray-600 focus:ring-gray-400 file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300'} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer`}
				/>
			
			{errosArquivos.length > 0 && (
				<div className={`mt-3 p-4 rounded-xl ${isDarkMode ? 'bg-red-900/20 border border-red-600/50' : 'bg-red-50 border border-red-200'}`}>
					<div className={`flex items-start gap-2 mb-2`}>
						<AlertCircle className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
						<div className="flex-1">
							<h4 className={`font-semibold text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
								Erro ao enviar arquivos:
							</h4>
							<ul className={`mt-2 space-y-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
								{errosArquivos.map((erro, index) => (
									<li key={index} className="flex flex-col">
										<span className="font-medium">{erro.nome}</span>
										<span className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{erro.erro}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}
			
			{(() => {
				// Determinar quais arquivos mostrar
				const arquivosNovos = isEditing && arquivos.filter(a => !(a instanceof File)).length > 0
					? arquivos.filter(a => a instanceof File)  // Apenas novos se já tem documentos
					: arquivos;  // Todos para outros casos
				
				return arquivosNovos.length > 0 && (
					<div className="mt-4 space-y-3">
						<p className={`text-xs font-medium ${theme.text.tertiary}`}>
							{isEditing && arquivos.filter(a => !(a instanceof File)).length > 0 ? (
								<>
									📤 Novos arquivos para enviar:
									<span className={`ml-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
										({arquivosNovos.length})
									</span>
								</>
							) : (
								`${arquivosNovos.length} arquivo(s) selecionado(s)`
							)}
						</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{arquivosNovos.map((arquivo, i) => {
							const isImage = arquivo.type?.startsWith('image/');
							const imageUrl = isImage ? URL.createObjectURL(arquivo) : null;
							
							return (
								<div key={i} className={`relative border rounded-xl p-3 transition-all ${isDarkMode ? 'bg-blue-900/20 border-blue-600/50 hover:border-blue-500' : 'bg-gray-100 border-gray-300 hover:border-gray-400'}`}>
									{isImage && imageUrl ? (
										<div className="space-y-2">
											<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5">
												<img
													src={imageUrl}
													alt={arquivo.name}
													className="w-full h-full object-cover"
													onLoad={() => URL.revokeObjectURL(imageUrl)}
												/>
											</div>
											<div className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-2 flex-1 min-w-0">
													<Image className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-gray-700'}`} />
													<span className={`text-xs truncate ${theme.text.secondary}`}>{arquivo.name}</span>
												</div>
												<button
													onClick={() => removerArquivo(i)}
													className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
													title="Remover imagem"
												>
													<X className="w-4 h-4" />
												</button>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<FileText className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-gray-700'}`} />
											<span className={`text-xs truncate flex-1 ${theme.text.secondary}`}>{arquivo.name}</span>
											<button
												onClick={() => removerArquivo(i)}
												className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
												title="Remover arquivo"
											>
												<X className="w-4 h-4" />
											</button>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
				);
			})()}
		</div>

			<div className="flex gap-3">
				<button
					onClick={onSave}
					disabled={isSaving}
					className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{isSaving ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							{isEditing ? "Atualizando..." : "Salvando..."}
						</>
					) : (
						<>{isEditing ? "Atualizar Trilha" : "Salvar Trilha"}</>
					)}
				</button>
				<button
					onClick={onCancel}
					disabled={isSaving}
					className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancelar
				</button>
			</div>
		</div>
	);
}
