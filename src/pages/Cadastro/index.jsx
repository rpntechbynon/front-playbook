import React, { useState, useEffect } from "react";
import MenuSuperior from "../MenuSuperior";
import { Plus, Loader2, AlertCircle, FileText, Upload, X, Image as ImageIcon, Edit, Trash2, Maximize2, CheckSquare, Square } from "lucide-react";
import { useTrilhas } from "../../hooks/useTrilhas";
import { useTheme } from "../../contexts/ThemeContext";
import TrilhaForm from "../../components/TrilhaForm";
import TrilhaCard from "../../components/TrilhaCard";
import TrilhaModal from "../../components/TrilhaModal";
import API_BASE_URL from "../../config/api";

export default function Cadastro() {
	const { trilhas, loading, error, adicionarTrilha, excluirTrilha: excluirTrilhaAPI, atualizarTrilha } = useTrilhas();
	const { theme, isDarkMode } = useTheme();
	const [showForm, setShowForm] = useState(false);
	const [expandedTrilha, setExpandedTrilha] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState({});
	const [titulo, setTitulo] = useState("");
	const [arquivos, setArquivos] = useState([]);
	const [goToSelecionados, setGoToSelecionados] = useState([]);
	const [showEtapaForm, setShowEtapaForm] = useState(false);
	const [novaEtapa, setNovaEtapa] = useState({ trilhaId: null, parentId: null, titulo: "", descricao: "", arquivos: [], goTo: [], isEdit: false, etapaId: null });
	const [salvandoEtapa, setSalvandoEtapa] = useState(false);
	const [mensagemSucesso, setMensagemSucesso] = useState("");
	const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'lista'
	const [decisoesDisponiveis, setDecisoesDisponiveis] = useState([]);
	const [loadingDecisoes, setLoadingDecisoes] = useState(false)

	// Buscar decisões disponíveis do endpoint
	useEffect(() => {
		const buscarDecisoes = async () => {
			try {
				setLoadingDecisoes(true);
				const response = await fetch(`${API_BASE_URL}/decisoes/all`);
				if (response.ok) {
					const data = await response.json();
					setDecisoesDisponiveis(data);
				}
			} catch (error) {
				console.error('Erro ao buscar decisões:', error);
			} finally {
				setLoadingDecisoes(false);
			}
		};
		buscarDecisoes();
	}, []);

	const toggleNode = (nodeId) => {
		setExpandedNodes(prev => ({
			...prev,
			[nodeId]: !prev[nodeId]
		}));
	};

	const handleAddEtapa = (trilhaId, parentId) => {
		setNovaEtapa({ trilhaId, parentId, titulo: "", descricao: "", arquivos: [], goTo: [], isEdit: false, etapaId: null });
		setShowEtapaForm(true);
	};

	const handleEditEtapa = (trilhaId, etapa) => {
		// Converter goTo string para array de números
		const goToArray = etapa.goTo ? etapa.goTo.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
		
		setNovaEtapa({ 
			trilhaId, 
			parentId: etapa.parentId || null, 
			titulo: etapa.titulo, 
			descricao: etapa.descricao, 
			arquivos: etapa.anexos || [],
			goTo: goToArray,
			isEdit: true,
			etapaId: etapa.id
		});
		setShowEtapaForm(true);
	};

	const salvarNovaEtapa = async () => {
		if (!novaEtapa.titulo.trim()) {
			alert("Digite um título para a etapa");
			return;
		}

		if (salvandoEtapa) return; // Prevenir múltiplos cliques

		const trilha = trilhas.find(t => t.id === novaEtapa.trilhaId);
		if (!trilha) return;

			try {
			setSalvandoEtapa(true);

			// Se for edição, atualizar etapa existente
			if (novaEtapa.isEdit) {
				const arquivosNovos = novaEtapa.arquivos.filter(a => a instanceof File);
				console.log('Arquivos novos para upload:', arquivosNovos.length);
				
				// Converter array de IDs para string separada por vírgula
				const goToString = novaEtapa.goTo && novaEtapa.goTo.length > 0 ? novaEtapa.goTo.join(',') : '';
				
				// Usar o ID da etapa que está sendo editada (novaEtapa.etapaId), não o trilhaId
				await atualizarTrilha(novaEtapa.etapaId, {
					descricao: novaEtapa.descricao,
					titulo: novaEtapa.titulo,
					go_to: goToString
				}, arquivosNovos);
				
				setMensagemSucesso("Etapa atualizada com sucesso!");
				setTimeout(() => setMensagemSucesso(""), 3000);
				
				setShowEtapaForm(false);
				setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", arquivos: [], goTo: [], isEdit: false, etapaId: null });
				return;
			}

			// Adicionar nova etapa - criar uma nova decisão com id_pai
			const arquivosNovos = novaEtapa.arquivos.filter(a => a instanceof File);
			console.log('Criando nova etapa com arquivos:', arquivosNovos.length);
			
			// Se parentId é null, o id_pai é o da trilha principal, senão é o parentId
			const idPai = novaEtapa.parentId === null ? trilha.id : novaEtapa.parentId;
			
			// Converter array de IDs para string separada por vírgula
			const goToString = novaEtapa.goTo && novaEtapa.goTo.length > 0 ? novaEtapa.goTo.join(',') : '';
			
			// Criar uma nova decisão (etapa) com id_pai
			await adicionarTrilha({
				descricao: novaEtapa.descricao,
				titulo: novaEtapa.titulo,
				id_pai: idPai,
				go_to: goToString,
				arquivos: arquivosNovos
			});			setMensagemSucesso("Etapa adicionada com sucesso!");
			setTimeout(() => setMensagemSucesso(""), 3000);
			
			setShowEtapaForm(false);
			setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", arquivos: [], goTo: [], isEdit: false, etapaId: null });
			
			// Expandir o nó pai automaticamente
			if (novaEtapa.parentId) {
				setExpandedNodes(prev => ({ ...prev, [novaEtapa.parentId]: true }));
			}
		} catch (error) {
			console.error('Erro ao salvar etapa:', error);
			alert('Erro ao salvar etapa. Tente novamente.');
		} finally {
			setSalvandoEtapa(false);
		}
	};

	const handleRemoveEtapa = async (trilhaId, etapaId) => {
		if (!confirm("Tem certeza que deseja remover esta etapa e todas suas sub-etapas?")) return;

		const trilha = trilhas.find(t => t.id === trilhaId);
		if (!trilha) return;

		// Função recursiva para remover etapa
		const removerEtapaRecursiva = (etapas) => {
			return etapas.filter(etapa => {
				if (etapa.id === etapaId) return false;
				if (etapa.subEtapas && etapa.subEtapas.length > 0) {
					etapa.subEtapas = removerEtapaRecursiva(etapa.subEtapas);
				}
				return true;
			});
		};

		const novasEtapas = removerEtapaRecursiva(trilha.etapas);
		await atualizarTrilha(trilha.id, { ...trilha, etapas: novasEtapas });
	};

	const salvarTrilha = async () => {
		if (!titulo.trim()) {
			alert("Por favor, informe o título da trilha!");
			return;
		}

		try {
			// Converter array de IDs para string separada por vírgula
			const goToString = goToSelecionados.length > 0 ? goToSelecionados.join(',') : '';
			
			// Criar apenas a trilha raiz (pai) com título e arquivos
			const novaTrilha = {
				titulo: titulo,
				descricao: titulo, // Usar o título como descrição também
				go_to: goToString,
				arquivos: arquivos
			};

			await adicionarTrilha(novaTrilha);
			setTitulo("");
			setArquivos([]);
			setGoToSelecionados([]);
			setShowForm(false);
			setMensagemSucesso("Trilha criada! Agora adicione etapas clicando em 'Ver Árvore'.");
			setTimeout(() => setMensagemSucesso(""), 5000);
		} catch (err) {
			alert("Erro ao salvar trilha: " + err.message);
		}
	};

	const excluirTrilha = async (id) => {
		if (confirm("Deseja realmente excluir esta trilha?")) {
			try {
				await excluirTrilhaAPI(id);
			} catch (err) {
				alert("Erro ao excluir trilha: " + err.message);
			}
		}
	};

	return (
		<>
			<MenuSuperior />
			<main className={`min-h-screen pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 pb-12 ${theme.bg.primary} transition-all duration-300`}>
				<div className="max-w-7xl mx-auto">
					{/* Mensagem de Sucesso */}
					{mensagemSucesso && (
						<div className={`mb-6 ${isDarkMode ? 'bg-green-900/50 border-green-500/50' : 'bg-green-100 border-green-300'} border rounded-xl p-4 flex items-center gap-3 transition-all duration-300 animate-pulse`}>
							<AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-700'} flex-shrink-0`} />
							<p className={isDarkMode ? 'text-green-200' : 'text-green-800'}>{mensagemSucesso}</p>
						</div>
					)}

					{/* Mensagem de Erro */}
					{error && (
						<div className={`mb-6 ${isDarkMode ? 'bg-red-900/50 border-red-500/50' : 'bg-red-100 border-red-300'} border rounded-xl p-4 flex items-center gap-3 transition-all duration-300`}>
							<AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-700'} flex-shrink-0`} />
							<p className={isDarkMode ? 'text-red-200' : 'text-red-800'}>{error}</p>
						</div>
					)}

					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
						<div>
							<h1 className={`text-3xl sm:text-4xl font-black mb-2 ${theme.text.primary}`}>Cadastro de Trilhas</h1>
							<p className={theme.text.tertiary}>Gerencie suas trilhas de vendas e etapas</p>
						</div>
						<button
							onClick={() => setShowForm(!showForm)}
							className={`flex items-center gap-2 px-6 py-3 ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-900'} text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-105`}
						>
							<Plus className="w-5 h-5" />
							Nova Trilha
						</button>
					</div>

					{/* Formulário de Cadastro */}
					{showForm && (
						<TrilhaForm
							titulo={titulo}
							setTitulo={setTitulo}
							arquivos={arquivos}
							setArquivos={setArquivos}
							goToSelecionados={goToSelecionados}
							setGoToSelecionados={setGoToSelecionados}
							decisoesDisponiveis={decisoesDisponiveis}
							loadingDecisoes={loadingDecisoes}
							onSave={salvarTrilha}
							onCancel={() => setShowForm(false)}
						/>
					)}

					{/* Lista de Trilhas Cadastradas */}
					<div>
						<div className="flex items-center justify-between mb-6">
							<h2 className={`text-2xl font-bold ${theme.text.primary}`}>Trilhas Cadastradas</h2>
							<div className="flex gap-2">
								<button 
									onClick={() => setViewMode('grid')}
									className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
										viewMode === 'grid' 
											? isDarkMode ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-gray-800 text-white'
											: isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
								>
									Grid
								</button>
								<button 
									onClick={() => setViewMode('lista')}
									className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
										viewMode === 'lista' 
											? isDarkMode ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-gray-800 text-white'
											: isDarkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
								>
									Lista
								</button>
							</div>
						</div>
						
						{loading ? (
							<div className={`${theme.bg.card} rounded-2xl ${theme.shadow.card} p-12 border ${theme.border.card} text-center transition-all duration-300`}>
								<Loader2 className={`w-16 h-16 ${isDarkMode ? 'text-blue-400' : 'text-gray-600'} mx-auto mb-4 animate-spin`} />
								<p className={`text-lg ${theme.text.tertiary}`}>Carregando trilhas...</p>
							</div>
						) : trilhas.length === 0 ? (
							<div className={`${theme.bg.card} rounded-2xl ${theme.shadow.card} p-12 border ${theme.border.card} text-center transition-all duration-300`}>
								<FileText className={`w-16 h-16 mx-auto mb-4 ${theme.icon.secondary}`} />
								<p className={`text-lg ${theme.text.tertiary}`}>Nenhuma trilha cadastrada ainda.</p>
								<p className={`text-sm mt-2 ${theme.text.muted}`}>Clique em "Nova Trilha" para começar.</p>
							</div>
						) : viewMode === 'grid' ? (
							<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
								{trilhas.map((trilha) => (
									<TrilhaCard
										key={trilha.id}
										trilha={trilha}
										onViewTree={setExpandedTrilha}
										onEdit={(id) => console.log('Editar', id)}
										onDelete={excluirTrilha}
									/>
								))}
							</div>
						) : (
							<div className="space-y-3">
								{trilhas.map((trilha) => (
									<div 
										key={trilha.id} 
										className={`group ${theme.bg.card} rounded-xl ${theme.shadow.button} border ${theme.border.card} overflow-hidden hover:${theme.shadow.card} transition-all duration-300 hover:scale-[1.01]`}
									>
										<div className="flex items-center gap-4 p-4">
											{/* Ícone/Número */}
											<div className={`w-16 h-16 ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'} rounded-xl flex items-center justify-center ${theme.shadow.button} flex-shrink-0`}>
												<span className="text-white font-black text-xl">{trilha.etapas?.length || 0}</span>
											</div>

											{/* Informações */}
											<div className="flex-1 min-w-0">
												<h3 className={`text-lg font-bold ${theme.text.primary} mb-1 truncate`}>{trilha.nome}</h3>
											<div className={`flex items-center gap-4 text-xs ${theme.text.tertiary}`}>
												<span className="flex items-center gap-1">
													<FileText className="w-3 h-3" />
													{trilha.etapas?.length || 0} etapas
												</span>
												<span className="flex items-center gap-1">
													<ImageIcon className="w-3 h-3" />
													{trilha.etapas?.reduce((acc, e) => acc + (e.anexos?.length || 0), 0) || 0} anexos
												</span>
											</div>
											</div>

											{/* Ações */}
											<div className="flex gap-2 flex-shrink-0">
												<button
													onClick={() => setExpandedTrilha(trilha.id)}
													className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30' : 'bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300'} border rounded-lg transition-all text-sm font-medium`}
												>
													<Maximize2 className="w-4 h-4" />
													Ver Árvore
												</button>
												<button 
													onClick={() => console.log('Editar', trilha.id)}
													className={`p-2 ${isDarkMode ? 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'} border rounded-lg transition-all`}
													title="Editar"
												>
													<Edit className="w-4 h-4" />
												</button>
												<button
													onClick={() => excluirTrilha(trilha.id)}
													className={`p-2 ${isDarkMode ? 'bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30' : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'} border rounded-lg transition-all`}
													title="Excluir"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Modal de Detalhes - Visualização em Árvore */}
					<TrilhaModal
						trilha={trilhas.find(t => t.id === expandedTrilha)}
						expandedNodes={expandedNodes}
						onToggleNode={toggleNode}
						onClose={() => setExpandedTrilha(null)}
						onAddEtapa={handleAddEtapa}
						onEditEtapa={handleEditEtapa}
						onRemoveEtapa={handleRemoveEtapa}
					/>

					{/* Modal de Adicionar/Editar Etapa */}
					{showEtapaForm && (
						<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowEtapaForm(false)}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full max-h-[90vh] overflow-y-auto p-6 ${theme.bg.card} ${theme.border.card} transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
								<h3 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
									{novaEtapa.isEdit ? "Editar Etapa" : (novaEtapa.parentId ? "Adicionar Sub-Etapa" : "Adicionar Etapa Principal")}
								</h3>
								
								<div className="space-y-4">
									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>Título</label>
										<input
											type="text"
											value={novaEtapa.titulo}
											onChange={(e) => setNovaEtapa({ ...novaEtapa, titulo: e.target.value })}
											placeholder="Ex: Qualificação do Lead"
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'} transition-all`}
											autoFocus
										/>
									</div>
									
									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>Descrição</label>
										<textarea
											value={novaEtapa.descricao}
											onChange={(e) => setNovaEtapa({ ...novaEtapa, descricao: e.target.value })}
											placeholder="Descreva os detalhes desta etapa..."
											rows="3"
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'} transition-all resize-none`}
										/>
									</div>

									{/* Seletor de Go To (Decisões) para Etapas */}
									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<CheckSquare className="w-4 h-4" />
											Go To - Próximas Decisões
										</label>
										<p className={`text-xs mb-2 ${theme.text.tertiary}`}>
											Selecione as decisões para onde esta etapa pode direcionar
										</p>
										
										{loadingDecisoes ? (
											<div className={`p-3 border rounded-xl ${theme.bg.input} ${theme.border.input} text-center`}>
												<p className={`text-xs ${theme.text.tertiary}`}>Carregando...</p>
											</div>
										) : decisoesDisponiveis && decisoesDisponiveis.length > 0 ? (
											<div className={`border rounded-xl ${theme.bg.input} ${theme.border.input} max-h-40 overflow-y-auto`}>
												{decisoesDisponiveis.map((decisao) => (
													<div
														key={decisao.id}
														onClick={() => {
															const goToArray = novaEtapa.goTo || [];
															if (goToArray.includes(decisao.id)) {
																setNovaEtapa({ 
																	...novaEtapa, 
																	goTo: goToArray.filter(id => id !== decisao.id) 
																});
															} else {
																setNovaEtapa({ 
																	...novaEtapa, 
																	goTo: [...goToArray, decisao.id] 
																});
															}
														}}
														className={`p-2.5 border-b last:border-b-0 cursor-pointer transition-all ${
															isDarkMode 
																? 'border-slate-700 hover:bg-slate-700/30' 
																: 'border-gray-200 hover:bg-gray-100'
														} ${
															(novaEtapa.goTo || []).includes(decisao.id) 
																? isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50' 
																: ''
														}`}
													>
														<div className="flex items-start gap-2">
															<div className="pt-0.5">
																{(novaEtapa.goTo || []).includes(decisao.id) ? (
																	<CheckSquare className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
																) : (
																	<Square className={`w-4 h-4 ${theme.text.tertiary}`} />
																)}
															</div>
															<div className="flex-1">
																<p className={`font-medium text-xs ${theme.text.primary}`}>
																	{decisao.titulo}
																</p>
																{decisao.descricao && (
																	<p className={`text-[10px] mt-0.5 ${theme.text.tertiary}`}>
																		{decisao.descricao}
																	</p>
																)}
															</div>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className={`p-3 border rounded-xl ${theme.bg.input} ${theme.border.input} text-center`}>
												<p className={`text-xs ${theme.text.tertiary}`}>Nenhuma decisão disponível</p>
											</div>
										)}
										
										{(novaEtapa.goTo || []).length > 0 && (
											<p className={`text-xs mt-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
												{(novaEtapa.goTo || []).length} decisão(ões) selecionada(s)
											</p>
										)}
									</div>

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<Upload className="w-4 h-4" />
											Fotos/Anexos
										</label>
										<input
											type="file"
											multiple
											accept="image/*,.pdf,.doc,.docx"
											onChange={(e) => {
												const files = Array.from(e.target.files);
												setNovaEtapa({ ...novaEtapa, arquivos: [...novaEtapa.arquivos, ...files] });
												e.target.value = '';
											}}
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.secondary} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50 file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30' : 'focus:border-gray-600 focus:ring-gray-400 file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300'} transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer`}
											disabled={salvandoEtapa}
										/>
										{novaEtapa.arquivos.length > 0 && (
											<div className="mt-3 space-y-2">
												<p className={`text-xs ${theme.text.tertiary} font-medium`}>
													{novaEtapa.arquivos.length} arquivo(s):
													{novaEtapa.arquivos.filter(a => a instanceof File).length > 0 && (
														<span className={`ml-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
															({novaEtapa.arquivos.filter(a => a instanceof File).length} novo(s))
														</span>
													)}
													{novaEtapa.arquivos.filter(a => !(a instanceof File)).length > 0 && (
														<span className={`ml-2 ${isDarkMode ? 'text-blue-400' : 'text-gray-700'}`}>
															({novaEtapa.arquivos.filter(a => !(a instanceof File)).length} existente(s))
														</span>
													)}
												</p>
												<div className="flex flex-wrap gap-2">
													{novaEtapa.arquivos.map((arquivo, i) => {
														const isFile = arquivo instanceof File;
														const isImage = isFile 
															? arquivo.type?.startsWith('image/') 
															: arquivo.tipo?.startsWith('image/') || arquivo.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
														const nome = isFile ? arquivo.name : arquivo.nome;
														
														return (
															<div key={i} className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs ${theme.text.secondary} group transition-all ${isFile ? (isDarkMode ? 'bg-green-900/20 border-green-600/50' : 'bg-green-50 border-green-300') : (isDarkMode ? 'bg-blue-900/20 border-blue-600/50' : 'bg-gray-100 border-gray-300')} ${isDarkMode ? 'hover:border-slate-500' : 'hover:border-gray-400'}`}>
																{isImage ? (
																	<ImageIcon className={`w-3 h-3 ${isFile ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-blue-400' : 'text-gray-700')}`} />
																) : (
																	<FileText className={`w-3 h-3 ${isFile ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-blue-400' : 'text-gray-700')}`} />
																)}
																<span className="truncate max-w-[120px]">{nome}</span>
																{!isFile && <span className={`text-[10px] ${isDarkMode ? 'text-blue-300' : 'text-gray-600'}`}>(já salvo)</span>}
																{isFile && (
																	<button
																		onClick={() => setNovaEtapa({ ...novaEtapa, arquivos: novaEtapa.arquivos.filter((_, index) => index !== i) })}
																		className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} transition-colors ml-1`}
																		title="Remover arquivo"
																		disabled={salvandoEtapa}
																	>
																		<X className="w-3 h-3" />
																	</button>
																)}
															</div>
														);
													})}
												</div>
											</div>
										)}
									</div>
								</div>

								<div className="flex gap-3 mt-6">
									<button
										onClick={salvarNovaEtapa}
										disabled={salvandoEtapa}
										className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-900'} text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
									>
										{salvandoEtapa ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												{novaEtapa.isEdit ? "Salvando..." : "Adicionando..."}
											</>
										) : (
											<>{novaEtapa.isEdit ? "Salvar" : "Adicionar"}</>
										)}
									</button>
									<button
										onClick={() => {
											setShowEtapaForm(false);
											setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", arquivos: [], goTo: [], isEdit: false, etapaId: null });
										}}
										disabled={salvandoEtapa}
										className={`px-4 py-2 font-semibold rounded-xl ${theme.bg.button} ${theme.text.secondary} ${theme.hover} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
									>
										Cancelar
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>
		</>
	);
}
