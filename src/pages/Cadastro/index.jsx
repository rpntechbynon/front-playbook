import React, { useState, useEffect } from "react";
import MenuSuperior from "../MenuSuperior";
import { Plus, Loader2, AlertCircle, FileText, Upload, X, Image as ImageIcon, Edit, Trash2, Maximize2, CheckSquare, Square, Package, Menu, ArrowUp, ArrowDown, GripVertical, Hash } from "lucide-react";
import { useTrilhas } from "../../hooks/useTrilhas";
import { useTheme } from "../../contexts/ThemeContext";
import TrilhaForm from "../../components/TrilhaForm";
import TrilhaCard from "../../components/TrilhaCard";
import TrilhaModal from "../../components/TrilhaModal";
import API_BASE_URL from "../../config/api";
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
	rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente wrapper para tornar o card arrastável
function SortableTrilhaCard({ trilha, onViewTree, onEdit, onDelete, onAddSubmenu, onEditSubmenu, onRemoveSubmenu }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: trilha.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transition || 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
		opacity: isDragging ? 0.6 : 1,
		scale: isDragging ? '1.02' : '1',
		boxShadow: isDragging ? '0 20px 60px rgba(0, 0, 0, 0.3)' : 'none',
		zIndex: isDragging ? 50 : 'auto',
	};

	return (
		<div ref={setNodeRef} style={style} className="transition-all duration-300 ease-out">
			<div className="relative group">
				{/* Handle para arrastar - ícone visível no canto superior esquerdo */}
				<div
					{...attributes}
					{...listeners}
					className="absolute top-2 left-2 z-10 cursor-move p-2 rounded-lg bg-gradient-to-br from-blue-600/90 to-purple-600/90 hover:from-blue-500/90 hover:to-purple-500/90 transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 transform group-hover:scale-110 shadow-lg"
					title="Arrastar para reordenar"
				>
					<GripVertical className="w-4 h-4 text-white" />
				</div>
				<TrilhaCard
					trilha={trilha}
					onViewTree={onViewTree}
					onEdit={onEdit}
					onDelete={onDelete}
					onAddSubmenu={onAddSubmenu}
					onEditSubmenu={onEditSubmenu}
					onRemoveSubmenu={onRemoveSubmenu}
				/>
			</div>
		</div>
	);
}

// Componente wrapper para o modo lista
function SortableTrilhaListItem({ trilha, onViewTree, onEdit, onDelete, onAddSubmenu, onEditSubmenu, onRemoveSubmenu, theme, isDarkMode }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: trilha.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transition || 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
		opacity: isDragging ? 0.6 : 1,
		scale: isDragging ? '1.02' : '1',
		boxShadow: isDragging ? '0 20px 60px rgba(0, 0, 0, 0.3)' : 'none',
		zIndex: isDragging ? 50 : 'auto',
	};

	return (
		<div ref={setNodeRef} style={style} className="relative group transition-all duration-300 ease-out">
			<div 
				className={`${theme.bg.card} rounded-xl ${theme.shadow.button} border ${theme.border.card} overflow-hidden hover:${theme.shadow.card} transition-all duration-300 hover:scale-[1.01]`}
			>
				<div className="flex items-center gap-4 p-4">
					{/* Handle para arrastar */}
					<div
						{...attributes}
						{...listeners}
						className={`cursor-move p-2 rounded-lg transition-all duration-200 ease-out flex-shrink-0 transform hover:scale-110 ${isDarkMode ? 'hover:bg-blue-600/30' : 'hover:bg-blue-100'}`}
						title="Arrastar para reordenar"
					>
						<GripVertical className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
					</div>

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
										<span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>M</span>
										{totalSubmenus} {totalSubmenus === 1 ? 'submenu' : 'submenus'}
									</span>
								) : null;
							})()}
						</div>
					</div>
					
					{/* Ações */}
					<div className="flex gap-2 flex-shrink-0">
						<button
							onClick={() => onViewTree(trilha.id)}
							className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30' : 'bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300'} border rounded-lg transition-all text-sm font-medium`}
						>
							<Maximize2 className="w-4 h-4" />
							Ver Árvore
						</button>
						<button 
							onClick={() => onAddSubmenu(trilha.id)}
							className={`p-2 ${isDarkMode ? 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30' : 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200'} border rounded-lg transition-all`}
							title="Adicionar submenu"
						>
							<Menu className="w-4 h-4" />
						</button>
						<button 
							onClick={() => onEdit(trilha.id)}
							className={`p-2 ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-gray-200 border-gray-300 hover:bg-gray-300'} ${theme.text.secondary} border rounded-lg transition-all`}
							title="Editar"
						>
							<Edit className="w-4 h-4" />
						</button>
						<button
							onClick={() => onDelete(trilha.id)}
							className={`p-2 ${isDarkMode ? 'bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30' : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'} border rounded-lg transition-all`}
							title="Excluir"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Cadastro() {
	const { trilhas, loading, error, adicionarTrilha, excluirTrilha: excluirTrilhaAPI, atualizarTrilha, carregarTrilhas } = useTrilhas();
	const { theme, isDarkMode } = useTheme();
	const [showForm, setShowForm] = useState(false);
	const [expandedTrilha, setExpandedTrilha] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState({});
	const [titulo, setTitulo] = useState("");
	const [descricao, setDescricao] = useState("");
	const [ordem, setOrdem] = useState(null);
	const [arquivos, setArquivos] = useState([]);
	const [goToSelecionados, setGoToSelecionados] = useState([]);
	const [showEtapaForm, setShowEtapaForm] = useState(false);
	const [isEditingTrilha, setIsEditingTrilha] = useState(false);
	const [trilhaEditId, setTrilhaEditId] = useState(null);
	const [novaEtapa, setNovaEtapa] = useState({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], isEdit: false, etapaId: null });
	const [salvandoEtapa, setSalvandoEtapa] = useState(false);
	const [mensagemSucesso, setMensagemSucesso] = useState("");
	const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'lista'
	const [decisoesDisponiveis, setDecisoesDisponiveis] = useState([]);
	const [loadingDecisoes, setLoadingDecisoes] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [trilhaToDelete, setTrilhaToDelete] = useState(null);
	const [excluindo, setExcluindo] = useState(false);
	const [erroExclusao, setErroExclusao] = useState(null);
	const [showDeleteEtapaModal, setShowDeleteEtapaModal] = useState(false);
	const [etapaToDelete, setEtapaToDelete] = useState(null);
	const [showSubmenuForm, setShowSubmenuForm] = useState(false);
	const [submenuData, setSubmenuData] = useState({ etapaId: null, titulo: "", descricao: "", arquivos: [], produtos: [], isEdit: false, submenuId: null });
	const [salvandoSubmenu, setSalvandoSubmenu] = useState(false);
	const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
	const [loadingProdutos, setLoadingProdutos] = useState(false);
	const [errosArquivos, setErrosArquivos] = useState([]);
	const [errosArquivosEtapa, setErrosArquivosEtapa] = useState([]);

	// Configurar sensores para drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Precisa arrastar 8px antes de iniciar o drag
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Função para lidar com o final do drag
	const handleDragEnd = async (event) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = trilhas.findIndex((t) => t.id === active.id);
			const newIndex = trilhas.findIndex((t) => t.id === over.id);

			// Reordenar localmente primeiro para feedback imediato
			const newTrilhas = arrayMove(trilhas, oldIndex, newIndex);
			
			// Atualizar as ordens
			const trilhasComNovaOrdem = newTrilhas.map((trilha, index) => ({
				...trilha,
				ordem: index + 1
			}));

			try {
				// Atualizar a ordem da trilha movida no backend
				const trilhaMoved = trilhasComNovaOrdem[newIndex];
				await atualizarTrilha(trilhaMoved.id, { ordem: trilhaMoved.ordem });
				
				// Recarregar as trilhas para garantir sincronização
				await carregarTrilhas();
				
				setMensagemSucesso("Ordem atualizada com sucesso!");
				setTimeout(() => setMensagemSucesso(""), 3000);
			} catch (error) {
				console.error('Erro ao atualizar ordem:', error);
				// Recarregar trilhas para reverter a mudança local
				await carregarTrilhas();
				alert('Erro ao atualizar ordem. Tente novamente.');
			}
		}
	};

	// Buscar decisões disponíveis do endpoint
	useEffect(() => {
		const buscarDecisoes = async () => {
			try {
				setLoadingDecisoes(true);
				const response = await fetch(`${API_BASE_URL}/decisoes/all`);
				if (response.ok) {
					const data = await response.json();
					console.log('Decisões carregadas:', data.length, 'decisões');
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

	// Buscar produtos disponíveis do endpoint
	useEffect(() => {
		const buscarProdutos = async () => {
			try {
				setLoadingProdutos(true);
				const response = await fetch(`${API_BASE_URL}/produtos`);
				if (response.ok) {
					const data = await response.json();
					setProdutosDisponiveis(data);
				}
			} catch (error) {
				console.error('Erro ao buscar produtos:', error);
			} finally {
				setLoadingProdutos(false);
			}
		};
		buscarProdutos();
	}, []);

	const toggleNode = (nodeId) => {
		setExpandedNodes(prev => ({
			...prev,
			[nodeId]: !prev[nodeId]
		}));
	};

	const handleAddEtapa = (trilhaId, parentId) => {
		// Calcular próxima ordem com base nas etapas existentes
		const trilha = trilhas.find(t => t.id === trilhaId);
		let proximaOrdem = 1;
		
		if (trilha) {
			if (parentId === null) {
				// Etapa principal - buscar maior ordem nas etapas principais (etapas com id_pai = trilhaId)
				const etapasPrincipais = trilha.etapas?.filter(e => e.id_pai === trilhaId) || [];
				const ordens = etapasPrincipais.map(e => e.ordem || 0).filter(o => o > 0);
				if (ordens.length > 0) {
					proximaOrdem = Math.max(...ordens) + 1;
				}
			} else {
				// Sub-etapa - buscar maior ordem nas sub-etapas do mesmo pai
				const encontrarEtapa = (etapas, id) => {
					for (const etapa of etapas) {
						if (etapa.id === id) return etapa;
						if (etapa.etapas) {
							const found = encontrarEtapa(etapa.etapas, id);
							if (found) return found;
						}
					}
					return null;
				};
				const etapaPai = encontrarEtapa(trilha.etapas || [], parentId);
				if (etapaPai && etapaPai.etapas) {
					const ordens = etapaPai.etapas.map(e => e.ordem || 0).filter(o => o > 0);
					if (ordens.length > 0) {
						proximaOrdem = Math.max(...ordens) + 1;
					}
				}
			}
		}
		
		setNovaEtapa({ trilhaId, parentId, titulo: "", descricao: "", ordem: proximaOrdem, arquivos: [], goTo: [], produtos: [], isEdit: false, etapaId: null });
		setShowEtapaForm(true);
	};

	const handleEditEtapa = (trilhaId, etapa) => {
		// Converter goTo string para array de números
		const goToArray = etapa.goTo ? etapa.goTo.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
		
		// Converter produtos para o formato esperado
		const produtosArray = etapa.produtos ? etapa.produtos.map((p, index) => ({
			produto_id: p.produto_id || p.id,
			recomendado: p.recomendado || false,
			ordem: p.ordem || index
		})) : [];
		
		setNovaEtapa({ 
			trilhaId, 
			parentId: etapa.parentId || null, 
			titulo: etapa.titulo, 
			descricao: etapa.descricao,
			ordem: etapa.ordem !== null && etapa.ordem !== undefined ? etapa.ordem : null,
			arquivos: etapa.anexos || [],
			goTo: goToArray,
			produtos: produtosArray,
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
				
				const dadosAtualizacao = {
					descricao: novaEtapa.descricao,
					titulo: novaEtapa.titulo,
					ordem: novaEtapa.ordem,
					produtos: novaEtapa.produtos || []
				};
				
				if (!novaEtapa.parentId) {
					const goToString = novaEtapa.goTo && novaEtapa.goTo.length > 0 ? novaEtapa.goTo.join(',') : '';
					dadosAtualizacao.go_to = goToString;
				}
				
				await atualizarTrilha(novaEtapa.etapaId, dadosAtualizacao, arquivosNovos);
				
				setMensagemSucesso("Etapa atualizada com sucesso!");
				setTimeout(() => setMensagemSucesso(""), 3000);
				
				setShowEtapaForm(false);
				setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], isEdit: false, etapaId: null });
				return;
			}

			// Adicionar nova etapa - criar uma nova decisão com id_pai
			const arquivosNovos = novaEtapa.arquivos.filter(a => a instanceof File);
			console.log('Criando nova etapa com arquivos:', arquivosNovos.length);

			const idPai = novaEtapa.parentId === null ? trilha.id : novaEtapa.parentId;

			const novoDado = {
				descricao: novaEtapa.descricao,
				titulo: novaEtapa.titulo,
				ordem: novaEtapa.ordem,
				id_pai: idPai,
				arquivos: arquivosNovos,
				produtos: novaEtapa.produtos || []
			};

			if (novaEtapa.parentId === null) {
				const goToString = novaEtapa.goTo && novaEtapa.goTo.length > 0 ? novaEtapa.goTo.join(',') : '';
				novoDado.go_to = goToString;
			}

			await adicionarTrilha(novoDado);

			setMensagemSucesso("Etapa adicionada com sucesso!");
			setTimeout(() => setMensagemSucesso(""), 3000);
			
			setShowEtapaForm(false);
			setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], isEdit: false, etapaId: null });
			
			if (novaEtapa.parentId) {
				setExpandedNodes(prev => ({ ...prev, [novaEtapa.parentId]: true }));
			}
			setErrosArquivosEtapa([]);
		} catch (error) {
			console.error('Erro ao salvar etapa:', error);
			// Verificar se há erros de arquivo
			if (error.arquivos_com_erro) {
				setErrosArquivosEtapa(error.arquivos_com_erro);
			} else {
				alert('Erro ao salvar etapa. Tente novamente.');
			}
		} finally {
			setSalvandoEtapa(false);
		}
	};

	const handleRemoveEtapa = (trilhaId, etapaId) => {
		setEtapaToDelete({ trilhaId, etapaId });
		setShowDeleteEtapaModal(true);
	};

	const handleAddSubmenu = (etapaId) => {
		setSubmenuData({ etapaId, titulo: "", descricao: "", arquivos: [], produtos: [], isEdit: false, submenuId: null });
		setShowSubmenuForm(true);
	};

	const handleEditSubmenu = (etapaId, submenu) => {
		// Converter produtos para o formato esperado
		const produtosArray = submenu.produtos ? submenu.produtos.map((p, index) => ({
			produto_id: p.produto_id || p.id,
			recomendado: p.recomendado || false,
			ordem: p.ordem || index
		})) : [];
		
		setSubmenuData({ 
			etapaId, 
			titulo: submenu.titulo, 
			descricao: submenu.descricao, 
			arquivos: submenu.anexos || [],
			produtos: produtosArray,
			isEdit: true,
			submenuId: submenu.id
		});
		setShowSubmenuForm(true);
	};

	const handleRemoveSubmenu = async (submenuId) => {
		if (!confirm('Deseja realmente excluir este submenu?')) return;
		
		try {
			const response = await fetch(`${API_BASE_URL}/submenus/${submenuId}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) throw new Error('Erro ao excluir submenu');
			
			setMensagemSucesso("Submenu excluído com sucesso!");
			setTimeout(() => setMensagemSucesso(""), 3000);
			
			// Recarregar as trilhas para atualizar a visualização
			await carregarTrilhas();
		} catch (err) {
			alert('Erro ao excluir submenu: ' + err.message);
		}
	};

	const salvarSubmenu = async () => {
		if (!submenuData.titulo.trim()) {
			alert("Digite um título para o submenu");
			return;
		}

		if (salvandoSubmenu) return;

		try {
			setSalvandoSubmenu(true);

			if (submenuData.isEdit) {
				// Editar submenu existente
				const formData = new FormData();
				formData.append('_method', 'PUT');
				formData.append('titulo', submenuData.titulo);
				formData.append('descricao', submenuData.descricao || '');
				formData.append('decisao_id', submenuData.etapaId);
				
				// Adicionar produtos no formato correto
				if (submenuData.produtos && submenuData.produtos.length > 0) {
					submenuData.produtos.forEach((produto, index) => {
						formData.append(`produtos[${index}][produto_id]`, produto.produto_id);
						formData.append(`produtos[${index}][recomendado]`, produto.recomendado ? 1 : 0);
						formData.append(`produtos[${index}][ordem]`, produto.ordem || index);
					});
				}
				
				// Adicionar arquivos novos
				const arquivosNovos = submenuData.arquivos.filter(a => a instanceof File);
				arquivosNovos.forEach(arquivo => {
					formData.append('arquivos[]', arquivo);
				});
				
				const response = await fetch(`${API_BASE_URL}/submenus/${submenuData.submenuId}`, {
					method: 'POST',
					body: formData
				});
				
				if (!response.ok) throw new Error('Erro ao atualizar submenu');
				
				setMensagemSucesso("Submenu atualizado com sucesso!");
				setTimeout(() => setMensagemSucesso(""), 3000);
			} else {
				// Adicionar novo submenu
				const formData = new FormData();
				formData.append('decisao_id', submenuData.etapaId);
				formData.append('titulo', submenuData.titulo);
				formData.append('descricao', submenuData.descricao || '');
				
				// Adicionar produtos no formato correto
				if (submenuData.produtos && submenuData.produtos.length > 0) {
					submenuData.produtos.forEach((produto, index) => {
						formData.append(`produtos[${index}][produto_id]`, produto.produto_id);
						formData.append(`produtos[${index}][recomendado]`, produto.recomendado ? 1 : 0);
						formData.append(`produtos[${index}][ordem]`, produto.ordem || index);
					});
				}
				
				// Adicionar arquivos
				const arquivosNovos = submenuData.arquivos.filter(a => a instanceof File);
				arquivosNovos.forEach(arquivo => {
					formData.append('arquivos[]', arquivo);
				});
				
				const response = await fetch(`${API_BASE_URL}/submenus`, {
					method: 'POST',
					body: formData
				});
				
				if (!response.ok) throw new Error('Erro ao criar submenu');
				
				setMensagemSucesso("Submenu adicionado com sucesso!");
				setTimeout(() => setMensagemSucesso(""), 3000);
			}
			
			setShowSubmenuForm(false);
			setSubmenuData({ etapaId: null, titulo: "", descricao: "", arquivos: [], produtos: [], isEdit: false, submenuId: null });
			
			// Recarregar as trilhas para mostrar os novos submenus
			console.log('Recarregando trilhas após salvar submenu...');
			await carregarTrilhas();
			console.log('Trilhas recarregadas com sucesso!');
		} catch (error) {
			console.error('Erro ao salvar submenu:', error);
			alert('Erro ao salvar submenu. Tente novamente.');
		} finally {
			setSalvandoSubmenu(false);
		}
	};

	const confirmarExclusaoEtapa = async () => {
		if (!etapaToDelete) return;

		const { trilhaId, etapaId } = etapaToDelete;
		setExcluindo(true);

		try {
			// Chamar a API para excluir a etapa (decisão)
			await excluirTrilhaAPI(etapaId);
			setMensagemSucesso("Etapa excluída com sucesso!");
			setTimeout(() => setMensagemSucesso(""), 3000);
			setShowDeleteEtapaModal(false);
			setEtapaToDelete(null);
		} catch (err) {
			// Extrair mensagem de erro do JSON se for erro 422
			let mensagemErro = err.message;
			
			if (err.message.includes('422') || err.message.includes('Erro ao excluir')) {
				// Tentar extrair a mensagem do backend
				if (err.message.includes('decisões filhas') || err.message.includes('decis')) {
					mensagemErro = "Não é possível excluir esta etapa pois ela possui sub-etapas vinculadas.";
				}
			}
			
			setErroExclusao(mensagemErro);
			setShowDeleteEtapaModal(false);
			setEtapaToDelete(null);
		} finally {
			setExcluindo(false);
		}
	};

	const cancelarExclusaoEtapa = () => {
		setShowDeleteEtapaModal(false);
		setEtapaToDelete(null);
	};

	const handleEditTrilha = (trilhaId) => {
		const trilha = trilhas.find(t => t.id === trilhaId);
		if (!trilha) return;

		// Fechar o formulário primeiro
		setShowForm(false);
		
		// Usar setTimeout para garantir que o formulário seja desmontado
		setTimeout(() => {
			// Definir modo de edição e ID
			setIsEditingTrilha(true);
			setTrilhaEditId(trilhaId);
			
			// Carregar dados da trilha no formulário
			setTitulo(trilha.titulo || "");
			setDescricao(trilha.descricao || "");
			setOrdem(trilha.ordem || null);
			
			// Carregar go_to se existir
			const goToArray = trilha.go_to ? trilha.go_to.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
			setGoToSelecionados(goToArray);
			
			// Não carregar arquivos existentes para edição, apenas novos
			setArquivos([]);
			
			// Mostrar formulário novamente
			setShowForm(true);
		}, 10);
	};

	const salvarTrilha = async () => {
		if (!titulo.trim()) {
			alert("Por favor, informe o título da trilha!");
			return;
		}

		console.log('Salvando trilha com ordem:', ordem, typeof ordem);

		try {
			// Converter array de IDs para string separada por vírgula
			const goToString = goToSelecionados.length > 0 ? goToSelecionados.join(',') : '';
			
			if (isEditingTrilha && trilhaEditId) {
				// Editar trilha existente
				const arquivosNovos = arquivos.filter(a => a instanceof File);
				
				const dadosAtualizacao = {
					titulo: titulo,
					descricao: descricao,
					go_to: goToString,
					ordem: ordem
				};
				
				console.log('Dados para atualização:', dadosAtualizacao);
				
				await atualizarTrilha(trilhaEditId, dadosAtualizacao, arquivosNovos);
				
				setMensagemSucesso("Trilha atualizada com sucesso!");
				setTimeout(() => setMensagemSucesso(""), 3000);
			} else {
				// Criar apenas a trilha raiz (pai) com título e arquivos
				const novaTrilha = {
					titulo: titulo,
					descricao: descricao,
					go_to: goToString,
					ordem: ordem,
					arquivos: arquivos
				};
				
				console.log('Dados para criação:', novaTrilha);

				await adicionarTrilha(novaTrilha);
				setMensagemSucesso("Trilha criada! Agora adicione etapas clicando em 'Ver Árvore'.");
				setTimeout(() => setMensagemSucesso(""), 5000);
			}
			
			// Limpar formulário
			setTitulo("");
			setDescricao("");
			setOrdem(null);
			setArquivos([]);
			setGoToSelecionados([]);
			setIsEditingTrilha(false);
			setTrilhaEditId(null);
			setShowForm(false);
			setErrosArquivos([]); // Limpar erros ao salvar com sucesso
		} catch (err) {
			// Verificar se há erros de arquivo
			if (err.arquivos_com_erro) {
				setErrosArquivos(err.arquivos_com_erro);
				// Fazer scroll para o formulário para mostrar os erros
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				alert("Erro ao salvar trilha: " + err.message);
			}
		}
	};

	const excluirTrilha = async (id) => {
		setTrilhaToDelete(id);
		setShowDeleteModal(true);
	};

	const confirmarExclusao = async () => {
		if (!trilhaToDelete) return;
		
		setExcluindo(true);
		try {
			await excluirTrilhaAPI(trilhaToDelete);
			setMensagemSucesso("Trilha excluída com sucesso!");
			setTimeout(() => setMensagemSucesso(""), 3000);
			setShowDeleteModal(false);
			setTrilhaToDelete(null);
		} catch (err) {
			// Extrair mensagem de erro do JSON se for erro 422
			let mensagemErro = err.message;
			
			if (err.message.includes('422') || err.message.includes('Erro ao excluir')) {
				// Tentar extrair a mensagem do backend
				try {
					// A mensagem pode vir no formato que o backend retorna
					if (err.message.includes('decisões filhas')) {
						mensagemErro = "Não é possível excluir esta decisão pois ela possui decisões filhas vinculadas.";
					}
				} catch (e) {
					mensagemErro = err.message;
				}
			}
			
			setErroExclusao(mensagemErro);
			setShowDeleteModal(false);
			setTrilhaToDelete(null);
		} finally {
			setExcluindo(false);
		}
	};

	const cancelarExclusao = () => {
		setShowDeleteModal(false);
		setTrilhaToDelete(null);
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
						onClick={() => {
							if (!showForm) {
								// Abrir formulário de nova trilha
								// Calcular próxima ordem com base nas trilhas principais (sem id_pai)
								const trilhasPrincipais = trilhas.filter(t => !t.id_pai);
								const ordens = trilhasPrincipais.map(t => t.ordem || 0).filter(o => o > 0);
								const proximaOrdem = ordens.length > 0 ? Math.max(...ordens) + 1 : 1;
								
								// Resetar todos os campos para nova trilha
								setTitulo("");
								setDescricao("");
								setOrdem(proximaOrdem);
								setArquivos([]);
								setGoToSelecionados([]);
								setIsEditingTrilha(false);
								setTrilhaEditId(null);
								setErrosArquivos([]);
								
								setShowForm(true);
							} else {
								// Fechar formulário
								setShowForm(false);
							}
						}}
						className={`flex items-center gap-2 px-6 py-3 ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-900'} text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-105`}
					>
						<Plus className="w-5 h-5" />
						{showForm ? "Cancelar" : "Nova Trilha"}
					</button>
				</div>

				{/* Formulário de Nova Trilha */}
				{showForm && (
					<TrilhaForm
						titulo={titulo}
						setTitulo={setTitulo}
						descricao={descricao}
						setDescricao={setDescricao}
						ordem={ordem}
						setOrdem={setOrdem}
						arquivos={arquivos}
						setArquivos={setArquivos}
						goToSelecionados={goToSelecionados}
						setGoToSelecionados={setGoToSelecionados}
						decisoesDisponiveis={decisoesDisponiveis}
						loadingDecisoes={loadingDecisoes}
						errosArquivos={errosArquivos}
						onSave={salvarTrilha}
						onCancel={() => {
							setShowForm(false);
							setTitulo("");
							setDescricao("");
							setOrdem(null);
							setArquivos([]);
							setGoToSelecionados([]);
							setIsEditingTrilha(false);
							setTrilhaEditId(null);
							setErrosArquivos([]);
						}}
						isEditing={isEditingTrilha}
					/>
				)}					{/* Lista de Trilhas Cadastradas */}
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
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={trilhas.map(t => t.id)}
								strategy={rectSortingStrategy}
							>
								<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
									{trilhas.map((trilha) => (
										<SortableTrilhaCard
											key={trilha.id}
											trilha={trilha}
											onViewTree={setExpandedTrilha}
											onEdit={handleEditTrilha}
											onDelete={excluirTrilha}
											onAddSubmenu={handleAddSubmenu}
											onEditSubmenu={handleEditSubmenu}
											onRemoveSubmenu={handleRemoveSubmenu}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					) : (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={trilhas.map(t => t.id)}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-3">
									{trilhas.map((trilha) => (
										<SortableTrilhaListItem
											key={trilha.id}
											trilha={trilha}
											onViewTree={setExpandedTrilha}
											onEdit={handleEditTrilha}
											onDelete={excluirTrilha}
											onAddSubmenu={handleAddSubmenu}
											onEditSubmenu={handleEditSubmenu}
											onRemoveSubmenu={handleRemoveSubmenu}
											theme={theme}
											isDarkMode={isDarkMode}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
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
					onAddSubmenu={handleAddSubmenu}
					onEditSubmenu={handleEditSubmenu}
					onRemoveSubmenu={handleRemoveSubmenu}
					onReloadTrilhas={carregarTrilhas}
				/>					{/* Modal de Adicionar/Editar Etapa */}
					{showEtapaForm && (
						<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => { setShowEtapaForm(false); setErrosArquivosEtapa([]); }}>
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

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<Hash className="w-4 h-4" />
											Ordem
										</label>
										<p className={`text-xs mb-2 ${theme.text.tertiary}`}>Defina a ordem de exibição desta etapa (ex: 1, 2, 3...)</p>
										<input
											type="number"
											min="1"
											value={novaEtapa.ordem || ""}
											onChange={(e) => {
												const valor = e.target.value ? parseInt(e.target.value) : null;
												setNovaEtapa({ ...novaEtapa, ordem: valor });
											}}
											placeholder="Ex: 1"
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'} transition-all`}
										/>
									</div>

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<Package className="w-4 h-4" />
											Produtos/Serviços
										</label>
										
										{/* Lista de produtos adicionados */}
										{novaEtapa.produtos && novaEtapa.produtos.length > 0 && (
											<div className="mb-2 space-y-1">
												{novaEtapa.produtos.map((prod, idx) => {
													const produtoInfo = produtosDisponiveis.find(p => p.id === prod.produto_id);
													return (
														<div key={idx} className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
															<div className="flex items-center gap-2 flex-1 min-w-0">
																<input
																	type="checkbox"
																	checked={prod.recomendado}
																	onChange={(e) => {
																		const novosProdutos = [...novaEtapa.produtos];
																		novosProdutos[idx].recomendado = e.target.checked;
																		setNovaEtapa({ ...novaEtapa, produtos: novosProdutos });
																	}}
																	className="w-3 h-3 rounded accent-blue-600 flex-shrink-0"
																	disabled={salvandoEtapa}
																	title="Recomendado"
																/>
																<span className={`font-semibold truncate ${theme.text.primary}`}>{produtoInfo?.nome}</span>
															</div>
															<button
																onClick={() => {
																	const novosProdutos = novaEtapa.produtos.filter((_, i) => i !== idx);
																	setNovaEtapa({ ...novaEtapa, produtos: novosProdutos });
																}}
																className={`p-1 rounded flex-shrink-0 ${isDarkMode ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
																disabled={salvandoEtapa}
															>
																<X className="w-3 h-3" />
															</button>
														</div>
													);
												})}
											</div>
										)}
										
										{/* Adicionar novo produto */}
										<select
											value=""
											onChange={(e) => {
												if (e.target.value) {
													const novoProduto = {
														produto_id: parseInt(e.target.value),
														recomendado: false,
														ordem: novaEtapa.produtos.length
													};
													setNovaEtapa({ ...novaEtapa, produtos: [...novaEtapa.produtos, novoProduto] });
												}
											}}
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'} transition-all`}
											disabled={salvandoEtapa || loadingProdutos}
										>
											<option value="">+ Adicionar produto</option>
											{produtosDisponiveis
												.filter(p => !novaEtapa.produtos.some(sp => sp.produto_id === p.id))
												.map((produto) => (
													<option key={produto.id} value={produto.id}>
														{produto.nome} {produto.descricao ? `- ${produto.descricao}` : ''}
													</option>
												))}
										</select>
										{loadingProdutos && (
											<p className={`text-xs mt-1 ${theme.text.tertiary}`}>Carregando produtos...</p>
										)}
									</div>

									{/* Seletor de Go To (Decisões) - Apenas para Etapas Principais */}
									{!novaEtapa.parentId && (
										<div>
											<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
												<CheckSquare className="w-4 h-4" />
												Go To - Próximas Decisões
											</label>
											<p className={`text-xs mb-2 ${theme.text.tertiary}`}>
												Selecione e organize as decisões em ordem
											</p>
											
											{/* Decisões Selecionadas com Ordem */}
											{(novaEtapa.goTo || []).length > 0 && (
												<div className="mb-3 space-y-2">
													<div className="flex items-center justify-between mb-2">
														<p className={`text-xs font-semibold ${theme.text.primary}`}>
															Decisões Selecionadas ({(novaEtapa.goTo || []).length})
														</p>
													</div>
													<div className="space-y-1">
														{(novaEtapa.goTo || []).map((decisaoId, index) => {
															const decisao = decisoesDisponiveis.find(d => d.id === decisaoId);
															if (!decisao) return null;
															
															return (
																<div
																	key={decisaoId}
																	className={`flex items-center gap-2 p-2 border rounded-lg ${
																		isDarkMode 
																			? 'bg-blue-900/20 border-blue-600/50 hover:bg-blue-900/30' 
																			: 'bg-blue-50 border-blue-300 hover:bg-blue-100'
																	} transition-all group`}
																>
																	{/* Handle para arrastar (visual) */}
																	<GripVertical className={`w-4 h-4 ${theme.text.tertiary} flex-shrink-0 cursor-move`} />
																	
																	{/* Número da ordem */}
																	<div className={`flex items-center justify-center w-6 h-6 rounded-md ${
																		isDarkMode ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-200 text-blue-700'
																	} font-bold text-xs flex-shrink-0`}>
																		{index + 1}
																	</div>
																	
																	{/* Informação da decisão */}
																	<div className="flex-1 min-w-0">
																		<p className={`font-medium text-xs ${theme.text.primary} truncate`}>
																			{decisao.titulo}
																		</p>
																	</div>
																	
																	{/* Botões de ação */}
																	<div className="flex items-center gap-1 flex-shrink-0">
																		{/* Mover para cima */}
																		<button
																			onClick={() => {
																				if (index === 0) return;
																				const newGoTo = [...novaEtapa.goTo];
																				[newGoTo[index - 1], newGoTo[index]] = [newGoTo[index], newGoTo[index - 1]];
																				setNovaEtapa({ ...novaEtapa, goTo: newGoTo });
																			}}
																			disabled={index === 0 || salvandoEtapa}
																			className={`p-1 rounded transition-all ${
																				index === 0 
																					? 'opacity-30 cursor-not-allowed' 
																					: isDarkMode 
																						? 'hover:bg-blue-600/30 text-blue-400' 
																						: 'hover:bg-blue-200 text-blue-700'
																			}`}
																			title="Mover para cima"
																		>
																			<ArrowUp className="w-3 h-3" />
																		</button>
																		
																		{/* Mover para baixo */}
																		<button
																			onClick={() => {
																				if (index === novaEtapa.goTo.length - 1) return;
																				const newGoTo = [...novaEtapa.goTo];
																				[newGoTo[index], newGoTo[index + 1]] = [newGoTo[index + 1], newGoTo[index]];
																				setNovaEtapa({ ...novaEtapa, goTo: newGoTo });
																			}}
																			disabled={index === novaEtapa.goTo.length - 1 || salvandoEtapa}
																			className={`p-1 rounded transition-all ${
																				index === novaEtapa.goTo.length - 1 
																					? 'opacity-30 cursor-not-allowed' 
																					: isDarkMode 
																						? 'hover:bg-blue-600/30 text-blue-400' 
																						: 'hover:bg-blue-200 text-blue-700'
																			}`}
																			title="Mover para baixo"
																		>
																			<ArrowDown className="w-3 h-3" />
																		</button>
																		
																		{/* Campo de ordem manual */}
																		<input
																			type="number"
																			min="1"
																			max={novaEtapa.goTo.length}
																			value={index + 1}
																			onChange={(e) => {
																				const newPosition = parseInt(e.target.value) - 1;
																				if (newPosition >= 0 && newPosition < novaEtapa.goTo.length && newPosition !== index) {
																					const newGoTo = [...novaEtapa.goTo];
																					const [removed] = newGoTo.splice(index, 1);
																					newGoTo.splice(newPosition, 0, removed);
																					setNovaEtapa({ ...novaEtapa, goTo: newGoTo });
																				}
																			}}
																			disabled={salvandoEtapa}
																			className={`w-10 px-1 py-0.5 text-center text-xs border rounded ${
																				isDarkMode 
																					? 'bg-slate-700 border-slate-600 text-slate-200' 
																					: 'bg-white border-gray-300 text-gray-800'
																			} focus:outline-none focus:ring-1 focus:ring-blue-500`}
																			title="Alterar ordem"
																		/>
																		
																		{/* Remover */}
																		<button
																			onClick={() => {
																				setNovaEtapa({ 
																					...novaEtapa, 
																					goTo: novaEtapa.goTo.filter(id => id !== decisaoId) 
																				});
																			}}
																			disabled={salvandoEtapa}
																			className={`p-1 rounded transition-all ${
																				isDarkMode 
																					? 'hover:bg-red-600/30 text-red-400' 
																					: 'hover:bg-red-100 text-red-600'
																			}`}
																			title="Remover"
																		>
																			<X className="w-3 h-3" />
																		</button>
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											)}
											
											{/* Lista de decisões disponíveis */}
											{loadingDecisoes ? (
												<div className={`p-3 border rounded-xl ${theme.bg.input} ${theme.border.input} text-center`}>
													<p className={`text-xs ${theme.text.tertiary}`}>Carregando...</p>
												</div>
											) : decisoesDisponiveis && decisoesDisponiveis.length > 0 ? (
												<div>
													<p className={`text-xs mb-2 ${theme.text.tertiary} font-medium`}>
														Clique para adicionar:
													</p>
													<div className={`border rounded-xl ${theme.bg.input} ${theme.border.input} max-h-40 overflow-y-auto`}>
														{decisoesDisponiveis
															.filter(decisao => !(novaEtapa.goTo || []).includes(decisao.id))
															.map((decisao) => (
																<div
																	key={decisao.id}
																	onClick={() => {
																		setNovaEtapa({ 
																			...novaEtapa, 
																			goTo: [...(novaEtapa.goTo || []), decisao.id] 
																		});
																	}}
																	className={`p-2.5 border-b last:border-b-0 cursor-pointer transition-all ${
																		isDarkMode 
																			? 'border-slate-700 hover:bg-slate-700/30' 
																			: 'border-gray-200 hover:bg-gray-100'
																	}`}
																>
																	<div className="flex items-start gap-2">
																		<div className="pt-0.5">
																			<Square className={`w-4 h-4 ${theme.text.tertiary}`} />
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
												</div>
											) : (
												<div className={`p-3 border rounded-xl ${theme.bg.input} ${theme.border.input} text-center`}>
													<p className={`text-xs ${theme.text.tertiary}`}>Nenhuma decisão disponível</p>
												</div>
											)}
										</div>
									)}

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
										
										{errosArquivosEtapa.length > 0 && (
											<div className={`mt-3 p-3 rounded-xl ${isDarkMode ? 'bg-red-900/20 border border-red-600/50' : 'bg-red-50 border border-red-200'}`}>
												<div className={`flex items-start gap-2`}>
													<AlertCircle className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0`} />
													<div className="flex-1">
														<h4 className={`font-semibold text-xs ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
															Erro ao enviar arquivos:
														</h4>
														<ul className={`mt-1 space-y-1 text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
															{errosArquivosEtapa.map((erro, index) => (
																<li key={index} className="flex flex-col">
																	<span className="font-medium">{erro.nome}</span>
																	<span className={`text-[10px] ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{erro.erro}</span>
																</li>
															))}
														</ul>
													</div>
												</div>
											</div>
										)}
										
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
											setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], isEdit: false, etapaId: null });
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

					{/* Modal de Confirmação de Exclusão */}
					{showDeleteModal && (
						<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={cancelarExclusao}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full p-6 ${theme.bg.card} ${theme.border.card} transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4`} onClick={(e) => e.stopPropagation()}>
								{/* Ícone de Alerta */}
								<div className="flex justify-center mb-4">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'} animate-pulse`}>
										<AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
									</div>
								</div>

								{/* Título */}
								<h3 className={`text-xl font-bold text-center mb-3 ${theme.text.primary}`}>
									Confirmar Exclusão
								</h3>

								{/* Mensagem */}
								<p className={`text-center mb-2 ${theme.text.secondary}`}>
									Tem certeza que deseja excluir esta trilha?
								</p>
								<p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
									⚠️ Todas as etapas e sub-etapas também serão removidas permanentemente!
								</p>

								{/* Botões */}
								<div className="flex gap-3">
									<button
										onClick={cancelarExclusao}
										disabled={excluindo}
										className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} disabled:opacity-50 disabled:cursor-not-allowed`}
									>
										Cancelar
									</button>
									<button
										onClick={confirmarExclusao}
										disabled={excluindo}
										className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/50' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'} text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
									>
										{excluindo ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												Excluindo...
											</>
										) : (
											'Sim, Excluir'
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Modal de Erro de Exclusão */}
					{erroExclusao && (
						<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setErroExclusao(null)}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full p-6 ${theme.bg.card} ${theme.border.card} transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4`} onClick={(e) => e.stopPropagation()}>
								{/* Ícone de Erro */}
								<div className="flex justify-center mb-4">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'} animate-bounce`}>
										<AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
									</div>
								</div>

								{/* Título */}
								<h3 className={`text-xl font-bold text-center mb-3 ${theme.text.primary}`}>
									Não foi possível excluir
								</h3>

								{/* Mensagem de Erro */}
								<div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'}`}>
									<p className={`text-center text-sm leading-relaxed ${isDarkMode ? 'text-orange-200' : 'text-orange-800'}`}>
										{erroExclusao}
									</p>
								</div>

								{/* Dica */}
								<p className={`text-center text-xs mb-4 ${theme.text.tertiary}`}>
									💡 Para excluir esta trilha, primeiro remova ou exclua todas as etapas filhas vinculadas.
								</p>

								{/* Botão */}
								<button
									onClick={() => setErroExclusao(null)}
									className={`w-full px-4 py-3 font-semibold rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-900'} text-white shadow-lg hover:shadow-xl hover:scale-105`}
								>
									Entendi
								</button>
							</div>
						</div>
					)}

					{/* Modal de Confirmação de Exclusão de Etapa */}
					{showDeleteEtapaModal && (
						<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={cancelarExclusaoEtapa}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full p-6 ${theme.bg.card} ${theme.border.card} transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4`} onClick={(e) => e.stopPropagation()}>
								{/* Ícone de Alerta */}
								<div className="flex justify-center mb-4">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'} animate-pulse`}>
										<AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
									</div>
								</div>

								{/* Título */}
								<h3 className={`text-xl font-bold text-center mb-3 ${theme.text.primary}`}>
									Confirmar Exclusão de Etapa
								</h3>

								{/* Mensagem */}
								<p className={`text-center mb-2 ${theme.text.secondary}`}>
									Tem certeza que deseja excluir esta etapa?
								</p>
								<p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
									⚠️ Todas as sub-etapas também serão removidas permanentemente!
								</p>

								{/* Botões */}
								<div className="flex gap-3">
									<button
										onClick={cancelarExclusaoEtapa}
										disabled={excluindo}
										className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} disabled:opacity-50 disabled:cursor-not-allowed`}
									>
										Cancelar
									</button>
									<button
										onClick={confirmarExclusaoEtapa}
										disabled={excluindo}
										className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/50' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'} text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
									>
										{excluindo ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												Excluindo...
											</>
										) : (
											'Sim, Excluir'
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Modal de Cadastro de Submenu */}
					{showSubmenuForm && (
						<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowSubmenuForm(false)}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full max-h-[90vh] overflow-y-auto p-6 ${theme.bg.card} ${theme.border.card} transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
								<h3 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
									{submenuData.isEdit ? "Editar Submenu" : "Adicionar Submenu"}
								</h3>
								
								<div className="space-y-4">
									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>Título</label>
										<input
											type="text"
											value={submenuData.titulo}
											onChange={(e) => setSubmenuData({ ...submenuData, titulo: e.target.value })}
											placeholder="Ex: Instruções, Documentação, etc."
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'} transition-all`}
											autoFocus
										/>
									</div>
									
									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary}`}>Descrição</label>
										<textarea
											value={submenuData.descricao}
											onChange={(e) => setSubmenuData({ ...submenuData, descricao: e.target.value })}
											placeholder="Descreva os detalhes deste submenu..."
											rows="3"
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'} transition-all resize-none`}
										/>
									</div>

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<Package className="w-4 h-4" />
											Produtos/Serviços
										</label>
										
										{/* Lista de produtos adicionados */}
										{submenuData.produtos && submenuData.produtos.length > 0 && (
											<div className="mb-3 space-y-2">
												{submenuData.produtos.map((prod, idx) => {
													const produtoInfo = produtosDisponiveis.find(p => p.id === prod.produto_id);
													return (
														<div key={idx} className={`flex items-center justify-between p-2 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
															<div className="flex-1">
																<p className={`font-semibold text-sm ${theme.text.primary}`}>{produtoInfo?.nome}</p>
																<p className={`text-xs ${theme.text.tertiary}`}>
																	{prod.recomendado ? '✓ Recomendado' : 'Não recomendado'} • Ordem: {prod.ordem}
																</p>
															</div>
															<button
																onClick={() => {
																	const novosProdutos = submenuData.produtos.filter((_, i) => i !== idx);
																	setSubmenuData({ ...submenuData, produtos: novosProdutos });
																}}
																className={`p-1 rounded ${isDarkMode ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
																disabled={salvandoSubmenu}
															>
																<X className="w-4 h-4" />
															</button>
														</div>
													);
												})}
											</div>
										)}
										
										{/* Adicionar novo produto */}
										<div className="flex gap-2">
											<select
												value=""
												onChange={(e) => {
													if (e.target.value) {
														const novoProduto = {
															produto_id: parseInt(e.target.value),
															recomendado: false,
															ordem: submenuData.produtos.length
														};
														setSubmenuData({ ...submenuData, produtos: [...submenuData.produtos, novoProduto] });
													}
												}}
												className={`flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50' : 'focus:border-gray-600 focus:ring-gray-400'} transition-all`}
												disabled={salvandoSubmenu || loadingProdutos}
											>
												<option value="">+ Adicionar produto</option>
												{produtosDisponiveis
													.filter(p => !submenuData.produtos.some(sp => sp.produto_id === p.id))
													.map((produto) => (
														<option key={produto.id} value={produto.id}>
															{produto.nome} {produto.descricao ? `- ${produto.descricao}` : ''}
														</option>
													))}
											</select>
										</div>
										{loadingProdutos && (
											<p className={`text-xs mt-1 ${theme.text.tertiary}`}>Carregando produtos...</p>
										)}
										
										{/* Controles para marcar como recomendado os produtos adicionados */}
										{submenuData.produtos && submenuData.produtos.length > 0 && (
											<div className="mt-3 space-y-2">
												{submenuData.produtos.map((prod, idx) => {
													const produtoInfo = produtosDisponiveis.find(p => p.id === prod.produto_id);
													return (
														<div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-slate-800/30' : 'bg-gray-100'}`}>
															<label className="flex items-center gap-2 cursor-pointer flex-1">
																<input
																	type="checkbox"
																	checked={prod.recomendado}
																	onChange={(e) => {
																		const novosProdutos = [...submenuData.produtos];
																		novosProdutos[idx].recomendado = e.target.checked;
																		setSubmenuData({ ...submenuData, produtos: novosProdutos });
																	}}
																	className="w-4 h-4 rounded accent-blue-600"
																	disabled={salvandoSubmenu}
																/>
																<span className={`text-xs ${theme.text.secondary}`}>
																	Recomendar <strong>{produtoInfo?.nome}</strong>
																</span>
															</label>
														</div>
													);
												})}
											</div>
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
												setSubmenuData({ ...submenuData, arquivos: [...submenuData.arquivos, ...files] });
												e.target.value = '';
											}}
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${theme.bg.input} ${theme.border.input} ${theme.text.secondary} ${isDarkMode ? 'focus:border-blue-500 focus:ring-blue-500/50 file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30' : 'focus:border-gray-600 focus:ring-gray-400 file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300'} transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer`}
											disabled={salvandoSubmenu}
										/>
										{submenuData.arquivos.length > 0 && (
											<div className="mt-3 space-y-2">
												<p className={`text-xs ${theme.text.tertiary} font-medium`}>
													{submenuData.arquivos.length} arquivo(s)
												</p>
												<div className="flex flex-wrap gap-2">
													{submenuData.arquivos.map((arquivo, i) => {
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
																		onClick={() => setSubmenuData({ ...submenuData, arquivos: submenuData.arquivos.filter((_, index) => index !== i) })}
																		className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} transition-colors ml-1`}
																		title="Remover arquivo"
																		disabled={salvandoSubmenu}
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
										onClick={salvarSubmenu}
										disabled={salvandoSubmenu}
										className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/50' : 'bg-gray-800 hover:bg-gray-900'} text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
									>
										{salvandoSubmenu ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												{submenuData.isEdit ? "Salvando..." : "Adicionando..."}
											</>
										) : (
											<>{submenuData.isEdit ? "Salvar" : "Adicionar"}</>
										)}
									</button>
									<button
										onClick={() => {
											setShowSubmenuForm(false);
											setSubmenuData({ etapaId: null, titulo: "", descricao: "", arquivos: [], produtos: [], isEdit: false, submenuId: null });
										}}
										disabled={salvandoSubmenu}
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
