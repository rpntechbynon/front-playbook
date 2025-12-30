import React from "react";
import { Plus, Upload, X, Image, FileText, CheckSquare, Square, AlertCircle } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function TrilhaForm({ 
	titulo, 
	setTitulo,
	descricao,
	setDescricao,
	arquivos,
	setArquivos,
	goToSelecionados,
	setGoToSelecionados,
	decisoesDisponiveis,
	loadingDecisoes,
	onSave, 
	onCancel,
	isEditing = false,
	errosArquivos = []
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

			<div className="mb-6">
				<label className={`block font-semibold mb-2 flex items-center gap-2 ${theme.text.secondary}`}>
					<Upload className="w-4 h-4" />
					Anexos (opcional)
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
			
			{arquivos.length > 0 && (
				<div className="mt-4 space-y-2">
					<p className={`text-xs font-medium ${theme.text.tertiary}`}>
						{arquivos.length} arquivo(s) selecionado(s)
					</p>
					<div className="flex flex-wrap gap-2">
						{arquivos.map((arquivo, i) => {
							const isImage = arquivo.type?.startsWith('image/');
							
							return (
								<div key={i} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs group transition-all ${isDarkMode ? 'bg-blue-900/20 border-blue-600/50 hover:border-blue-500' : 'bg-gray-100 border-gray-300 hover:border-gray-400'} ${theme.text.secondary}`}>
									{isImage ? (
										<Image className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-gray-700'}`} />
									) : (
										<FileText className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-gray-700'}`} />
									)}
									<span className="truncate max-w-[150px]">{arquivo.name}</span>
									<button
										onClick={() => removerArquivo(i)}
										className={`transition-colors ml-1 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
										title="Remover arquivo"
									>
										<X className="w-3 h-3" />
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>

			<div className="flex gap-3">
				<button
					onClick={onSave}
					className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-900'}`}
				>
					{isEditing ? "Atualizar Trilha" : "Salvar Trilha"}
				</button>
				<button
					onClick={onCancel}
					className={`px-6 py-3 font-semibold rounded-xl transition-all ${theme.bg.button} ${theme.text.secondary} ${theme.hover}`}
				>
					Cancelar
				</button>
			</div>
		</div>
	);
}
