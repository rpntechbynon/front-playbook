import React, { useState } from "react";
import MenuSuperior from "../MenuSuperior";
import { Plus, Loader2, AlertCircle, Edit, Trash2, Save, X, Package, DollarSign, Link as LinkIcon, Image as ImageIcon, FileText, CheckCircle, XCircle, Info } from "lucide-react";
import { useProdutos } from "../../hooks/useProdutos";
import { useTheme } from "../../contexts/ThemeContext";

export default function Produtos() {
	const { produtos, loading, error, adicionarProduto, atualizarProduto, excluirProduto, carregarProdutos } = useProdutos();
	const { theme, isDarkMode } = useTheme();
	
	const [showForm, setShowForm] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [salvando, setSalvando] = useState(false);
	const [mensagemSucesso, setMensagemSucesso] = useState("");
	const [mensagemErro, setMensagemErro] = useState("");
	const [showInfoModal, setShowInfoModal] = useState(false);
	const [selectedProduto, setSelectedProduto] = useState(null);
	
	const [formData, setFormData] = useState({
		nome: "",
		descricao: "",
		tipo: "servico",
		preco: "",
		link: "",
		imagem: "",
		ativo: true
	});

	const resetForm = () => {
		setFormData({
			nome: "",
			descricao: "",
			tipo: "servico",
			preco: "",
			link: "",
			imagem: "",
			ativo: true
		});
		setIsEditing(false);
		setEditingId(null);
		setShowForm(false);
	};

	const handleEditProduto = (produto) => {
		setFormData({
			nome: produto.nome || "",
			descricao: produto.descricao || "",
			tipo: produto.tipo || "servico",
			preco: produto.preco || "",
			link: produto.link || "",
			imagem: produto.imagem || "",
			ativo: produto.ativo ?? true
		});
		setIsEditing(true);
		setEditingId(produto.id);
		setShowForm(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!formData.nome.trim()) {
			setMensagemErro("O nome do produto é obrigatório");
			setTimeout(() => setMensagemErro(""), 3000);
			return;
		}

		if (salvando) return;

		try {
			setSalvando(true);
			setMensagemErro("");

			const dadosProduto = {
				nome: formData.nome.trim(),
				descricao: formData.descricao.trim(),
				tipo: formData.tipo,
				preco: formData.preco ? parseFloat(formData.preco) : null,
				link: formData.link.trim() || null,
				imagem: formData.imagem.trim() || null,
				ativo: formData.ativo
			};

			if (isEditing) {
				await atualizarProduto(editingId, dadosProduto);
				setMensagemSucesso("Produto atualizado com sucesso!");
			} else {
				await adicionarProduto(dadosProduto);
				setMensagemSucesso("Produto cadastrado com sucesso!");
			}

			setTimeout(() => setMensagemSucesso(""), 3000);
			resetForm();
		} catch (err) {
			setMensagemErro(err.message || "Erro ao salvar produto");
			setTimeout(() => setMensagemErro(""), 3000);
		} finally {
			setSalvando(false);
		}
	};

	const handleDeleteProduto = async (id) => {
		if (!confirm("Deseja realmente excluir este produto?")) return;

		try {
			await excluirProduto(id);
			setMensagemSucesso("Produto excluído com sucesso!");
			setTimeout(() => setMensagemSucesso(""), 3000);
		} catch (err) {
			setMensagemErro(err.message || "Erro ao excluir produto");
			setTimeout(() => setMensagemErro(""), 3000);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleShowInfo = (produto) => {
		setSelectedProduto(produto);
		setShowInfoModal(true);
	};

	return (
		<div className={`min-h-screen ${theme.bg.primary} transition-colors duration-300`}>
			<MenuSuperior />
			
			<div className="container mx-auto px-6 py-8 pt-28">
				{/* Cabeçalho */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
					<div>
						<h1 className={`text-3xl font-bold ${theme.text.primary} flex items-center gap-3`}>
							<Package className="w-8 h-8" />
							Cadastro de Produtos
						</h1>
						<p className={`mt-2 ${theme.text.secondary}`}>
							Gerencie os produtos e serviços do sistema
						</p>
					</div>
					<button
						onClick={() => setShowForm(true)}
						className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${theme.shadow.button} ${
							isDarkMode 
								? 'bg-blue-600 hover:bg-blue-700 text-white' 
								: 'bg-gray-800 hover:bg-gray-900 text-white'
						}`}
					>
						<Plus className="w-5 h-5" />
						Novo Produto
					</button>
				</div>

				{/* Mensagens */}
				{mensagemSucesso && (
					<div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
						isDarkMode ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-green-100 border-green-300 text-green-800'
					} border`}>
						<CheckCircle className="w-5 h-5" />
						<span className="font-medium">{mensagemSucesso}</span>
					</div>
				)}

				{mensagemErro && (
					<div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
						isDarkMode ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-red-100 border-red-300 text-red-800'
					} border`}>
						<AlertCircle className="w-5 h-5" />
						<span className="font-medium">{mensagemErro}</span>
					</div>
				)}

				{/* Lista de Produtos */}
				<div className={`rounded-2xl ${theme.shadow.card} ${theme.bg.card} ${theme.border.card} border overflow-hidden`}>
					{loading ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Loader2 className={`w-12 h-12 animate-spin ${theme.text.tertiary}`} />
							<p className={`mt-4 ${theme.text.secondary}`}>Carregando produtos...</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-12">
							<AlertCircle className={`w-12 h-12 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
							<p className={`mt-4 ${theme.text.primary} font-semibold`}>Erro ao carregar produtos</p>
							<p className={`mt-2 ${theme.text.secondary}`}>{error}</p>
							<button
								onClick={carregarProdutos}
								className={`mt-4 px-6 py-2 rounded-lg ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'} text-white transition-all`}
							>
								Tentar novamente
							</button>
						</div>
					) : produtos.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Package className={`w-16 h-16 ${theme.text.tertiary}`} />
							<p className={`mt-4 ${theme.text.primary} font-semibold text-lg`}>Nenhum produto cadastrado</p>
							<p className={`mt-2 ${theme.text.secondary}`}>Clique em "Novo Produto" para começar</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className={`${isDarkMode ? 'bg-slate-800/80' : 'bg-gray-100'} border-b ${theme.border.card}`}>
									<tr>
										<th className={`px-6 py-4 text-left text-sm font-bold ${theme.text.primary}`}>Nome</th>
										<th className={`px-6 py-4 text-left text-sm font-bold ${theme.text.primary}`}>Tipo</th>
										<th className={`px-6 py-4 text-left text-sm font-bold ${theme.text.primary}`}>Preço</th>
										<th className={`px-6 py-4 text-center text-sm font-bold ${theme.text.primary}`}>Status</th>
										<th className={`px-6 py-4 text-center text-sm font-bold ${theme.text.primary}`}>Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y" style={{ borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(229, 231, 235, 1)' }}>
									{produtos.map((produto) => (
										<tr
											key={produto.id}
											className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50'}`}
										>
											<td className={`px-6 py-4 ${theme.text.primary}`}>
												<div className="font-semibold">{produto.nome}</div>
												{produto.descricao && (
													<div className={`text-sm ${theme.text.tertiary} truncate max-w-xs mt-1`}>
														{produto.descricao}
													</div>
												)}
											</td>
											<td className="px-6 py-4">
												<span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
													produto.tipo === 'servico'
														? isDarkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-800 border border-blue-300'
														: isDarkMode ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'bg-purple-100 text-purple-800 border border-purple-300'
												}`}>
													{produto.tipo === 'servico' ? 'Serviço' : 'Produto'}
												</span>
											</td>
											<td className={`px-6 py-4 ${theme.text.secondary}`}>
												{produto.preco ? (
													<span className="font-semibold">R$ {parseFloat(produto.preco).toFixed(2)}</span>
												) : (
													<span className={theme.text.tertiary}>-</span>
												)}
											</td>
											<td className="px-6 py-4 text-center">
												<div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
													produto.ativo
														? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
														: isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
												}`}>
													{produto.ativo ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
													<span className="text-xs font-semibold">{produto.ativo ? 'Ativo' : 'Inativo'}</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-center gap-2">
													<button
														onClick={() => handleShowInfo(produto)}
														className={`p-2 rounded-lg transition-all ${
															isDarkMode 
																? 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30' 
																: 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
														} border`}
														title="Informações"
													>
														<Info className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleEditProduto(produto)}
														className={`p-2 rounded-lg transition-all ${
															isDarkMode 
																? 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30' 
																: 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
														} border`}
														title="Editar"
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleDeleteProduto(produto.id)}
														className={`p-2 rounded-lg transition-all ${
															isDarkMode 
																? 'bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30' 
																: 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'
														} border`}
														title="Excluir"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Modal de Formulário */}
				{showForm && (
					<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => !salvando && resetForm()}>
						<div
							className={`rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 ${theme.bg.card} ${theme.border.card} transition-all duration-300`}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-start mb-6">
								<h3 className={`text-2xl font-bold ${theme.text.primary} flex items-center gap-3`}>
									<Package className="w-7 h-7" />
									{isEditing ? "Editar Produto" : "Novo Produto"}
								</h3>
								<button
									onClick={resetForm}
									disabled={salvando}
									className={`p-2 rounded-lg transition-all ${theme.icon.primary} ${theme.icon.hover} ${theme.bg.hover}`}
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Nome */}
								<div>
									<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>
										Nome do Produto/Serviço <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.nome}
										onChange={(e) => handleInputChange('nome', e.target.value)}
										placeholder="Ex: Instalação de Película"
										className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${
											isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'
										} transition-all`}
										disabled={salvando}
										required
										autoFocus
									/>
								</div>

								{/* Descrição */}
								<div>
									<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>
										Descrição
									</label>
									<textarea
										value={formData.descricao}
										onChange={(e) => handleInputChange('descricao', e.target.value)}
										placeholder="Aplicação profissional de película de vidro..."
										rows="4"
										className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${
											isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'
										} transition-all resize-none`}
										disabled={salvando}
									/>
								</div>

								{/* Tipo */}
								<div>
									<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>
										Tipo
									</label>
									<div className="grid grid-cols-2 gap-3">
										<button
											type="button"
											onClick={() => handleInputChange('tipo', 'servico')}
											disabled={salvando}
											className={`py-3 px-4 rounded-xl font-semibold transition-all border ${
												formData.tipo === 'servico'
													? isDarkMode 
														? 'bg-blue-600/30 border-blue-500 text-blue-400' 
														: 'bg-blue-100 border-blue-500 text-blue-800'
													: isDarkMode
														? 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50'
														: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
											}`}
										>
											Serviço
										</button>
										<button
											type="button"
											onClick={() => handleInputChange('tipo', 'produto')}
											disabled={salvando}
											className={`py-3 px-4 rounded-xl font-semibold transition-all border ${
												formData.tipo === 'produto'
													? isDarkMode 
														? 'bg-purple-600/30 border-purple-500 text-purple-400' 
														: 'bg-purple-100 border-purple-500 text-purple-800'
													: isDarkMode
														? 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50'
														: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
											}`}
										>
											Produto
										</button>
									</div>
								</div>

								{/* Preço */}
								<div>
									<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
										<DollarSign className="w-4 h-4" />
										Preço
									</label>
									<input
										type="number"
										step="0.01"
										min="0"
										value={formData.preco}
										onChange={(e) => handleInputChange('preco', e.target.value)}
										placeholder="0.00"
										className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${
											isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'
										} transition-all`}
										disabled={salvando}
									/>
								</div>

								{/* Link */}
								<div>
									<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
										<LinkIcon className="w-4 h-4" />
										Link
									</label>
									<input
										type="url"
										value={formData.link}
										onChange={(e) => handleInputChange('link', e.target.value)}
										placeholder="https://exemplo.com"
										className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${
											isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'
										} transition-all`}
										disabled={salvando}
									/>
								</div>

								{/* Imagem */}
								<div>
									<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
										<ImageIcon className="w-4 h-4" />
										URL da Imagem
									</label>
									<input
										type="url"
										value={formData.imagem}
										onChange={(e) => handleInputChange('imagem', e.target.value)}
										placeholder="https://exemplo.com/imagem.jpg"
										className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${
											isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'
										} transition-all`}
										disabled={salvando}
									/>
								</div>

								{/* Ativo */}
								<div>
									<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>
										Status
									</label>
									<div className="grid grid-cols-2 gap-3">
										<button
											type="button"
											onClick={() => handleInputChange('ativo', true)}
											disabled={salvando}
											className={`py-3 px-4 rounded-xl font-semibold transition-all border flex items-center justify-center gap-2 ${
												formData.ativo
													? isDarkMode 
														? 'bg-green-600/30 border-green-500 text-green-400' 
														: 'bg-green-100 border-green-500 text-green-800'
													: isDarkMode
														? 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50'
														: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
											}`}
										>
											<CheckCircle className="w-4 h-4" />
											Ativo
										</button>
										<button
											type="button"
											onClick={() => handleInputChange('ativo', false)}
											disabled={salvando}
											className={`py-3 px-4 rounded-xl font-semibold transition-all border flex items-center justify-center gap-2 ${
												!formData.ativo
													? isDarkMode 
														? 'bg-red-600/30 border-red-500 text-red-400' 
														: 'bg-red-100 border-red-500 text-red-800'
													: isDarkMode
														? 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50'
														: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
											}`}
										>
											<XCircle className="w-4 h-4" />
											Inativo
										</button>
									</div>
								</div>

								{/* Botões */}
								<div className="flex gap-3 pt-4">
									<button
										type="button"
										onClick={resetForm}
										disabled={salvando}
										className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
											isDarkMode 
												? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' 
												: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
										}`}
									>
										Cancelar
									</button>
									<button
										type="submit"
										disabled={salvando}
										className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
											isDarkMode 
												? 'bg-blue-600 hover:bg-blue-700 text-white' 
												: 'bg-gray-800 hover:bg-gray-900 text-white'
										} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
									>
										{salvando ? (
											<>
												<Loader2 className="w-5 h-5 animate-spin" />
												Salvando...
											</>
										) : (
											<>
												<Save className="w-5 h-5" />
												{isEditing ? "Atualizar" : "Cadastrar"}
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Modal de Informações do Produto */}
				{showInfoModal && selectedProduto && (
					<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowInfoModal(false)}>
						<div
							className={`rounded-2xl shadow-2xl border max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 ${theme.bg.card} ${theme.border.card} transition-all duration-300`}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-start mb-6">
								<h3 className={`text-2xl font-bold ${theme.text.primary} flex items-center gap-3`}>
									<Package className="w-7 h-7" />
									Informações do Produto
								</h3>
								<button
									onClick={() => setShowInfoModal(false)}
									className={`p-2 rounded-lg transition-all ${theme.icon.primary} ${theme.icon.hover} ${theme.bg.hover}`}
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="space-y-4">
								<div>
									<label className={`block text-sm font-semibold ${theme.text.tertiary} mb-1`}>Nome</label>
									<p className={`text-base font-semibold ${theme.text.primary}`}>{selectedProduto.nome}</p>
								</div>

								{selectedProduto.descricao && (
									<div>
										<label className={`block text-sm font-semibold ${theme.text.tertiary} mb-1`}>Descrição</label>
										<p className={`text-base ${theme.text.secondary}`}>{selectedProduto.descricao}</p>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className={`block text-sm font-semibold ${theme.text.tertiary} mb-1`}>Tipo</label>
										<span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${
											selectedProduto.tipo === 'servico'
												? isDarkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-800 border border-blue-300'
												: isDarkMode ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'bg-purple-100 text-purple-800 border border-purple-300'
										}`}>
											{selectedProduto.tipo === 'servico' ? 'Serviço' : 'Produto'}
										</span>
									</div>

									<div>
										<label className={`block text-sm font-semibold ${theme.text.tertiary} mb-1`}>Status</label>
										<div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
											selectedProduto.ativo
												? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
												: isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
										}`}>
											{selectedProduto.ativo ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
											<span className="text-sm font-semibold">{selectedProduto.ativo ? 'Ativo' : 'Inativo'}</span>
										</div>
									</div>
								</div>

								{selectedProduto.preco && (
									<div>
										<label className={`block text-sm font-semibold ${theme.text.tertiary} mb-1 flex items-center gap-2`}>
											<DollarSign className="w-4 h-4" />
											Preço
										</label>
										<p className={`text-lg font-bold ${theme.text.primary}`}>
											R$ {parseFloat(selectedProduto.preco).toFixed(2)}
										</p>
									</div>
								)}

								{selectedProduto.link && (
									<div>
										<label className={`block text-sm font-semibold ${theme.text.tertiary} mb-1 flex items-center gap-2`}>
											<LinkIcon className="w-4 h-4" />
											Link
										</label>
										<a
											href={selectedProduto.link}
											target="_blank"
											rel="noopener noreferrer"
											className={`text-base break-all ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
										>
											{selectedProduto.link}
										</a>
									</div>
								)}

								{selectedProduto.imagem && (
									<div>
										<label className={`block text-sm font-semibold ${theme.text.tertiary} mb-1 flex items-center gap-2`}>
											<ImageIcon className="w-4 h-4" />
											Imagem
										</label>
										<div className={`mt-2 border rounded-xl overflow-hidden ${theme.border.card}`}>
											<img 
												src={selectedProduto.imagem} 
												alt={selectedProduto.nome}
												className="w-full h-auto"
												onError={(e) => {
													e.target.style.display = 'none';
													e.target.nextSibling.style.display = 'flex';
												}}
											/>
											<div 
												className={`hidden items-center justify-center p-8 ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}
											>
												<div className="text-center">
													<ImageIcon className={`w-12 h-12 mx-auto mb-2 ${theme.text.tertiary}`} />
													<p className={`text-sm ${theme.text.tertiary}`}>Imagem não disponível</p>
													<a
														href={selectedProduto.imagem}
														target="_blank"
														rel="noopener noreferrer"
														className={`text-xs mt-1 inline-block ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
													>
														Ver URL
													</a>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="flex gap-3 pt-6 mt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(229, 231, 235, 1)' }}>
								<button
									onClick={() => {
										setShowInfoModal(false);
										handleEditProduto(selectedProduto);
									}}
									className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
										isDarkMode 
											? 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30' 
											: 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
									} border`}
								>
									<Edit className="w-5 h-5" />
									Editar
								</button>
								<button
									onClick={() => setShowInfoModal(false)}
									className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
										isDarkMode 
											? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' 
											: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
									}`}
								>
									Fechar
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}