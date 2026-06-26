import { useState, useEffect } from "react";
import MenuSuperior from "../MenuSuperior";
import { Plus, Loader2, AlertCircle, FileText, Grid3x3, List, Search, Upload, X, Image as ImageIcon, Package, CheckSquare, Square, ArrowUp, ArrowDown, GripVertical, Hash, ClipboardList } from "lucide-react";
import FormularioService from "../../services/FormularioService";
import { useTrilhas } from "../../hooks/useTrilhas";
import { useTheme } from "../../contexts/ThemeContext";
import TrilhaForm from "../../components/TrilhaForm";
import TrilhaCard from "../../components/TrilhaCard";
import TrilhaModal from "../../components/TrilhaModal";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
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
	rectSortingStrategy,
} from '@dnd-kit/sortable';

export default function Cadastro() {
	const { trilhas, loading, error, adicionarTrilha, excluirTrilha: excluirTrilhaAPI, atualizarTrilha, carregarTrilhas } = useTrilhas();
	const { theme, isDarkMode } = useTheme();

	const [showForm, setShowForm] = useState(false);
	const [expandedTrilha, setExpandedTrilha] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState({});
	const [titulo, setTitulo] = useState("");
	const [descricao, setDescricao] = useState("");
	const [ordem, setOrdem] = useState(null);
	const [goToSelecionados, setGoToSelecionados] = useState([]);
	const [formulariosTrilha, setFormulariosTrilha] = useState([]);
	const [isEditingTrilha, setIsEditingTrilha] = useState(false);
	const [trilhaEditId, setTrilhaEditId] = useState(null);
	const [viewMode, setViewMode] = useState('grid');
	const [searchTerm, setSearchTerm] = useState("");
	const [arquivos, setArquivos] = useState([]);
	const [formKey, setFormKey] = useState(0); // Força remontagem do formulário
	
	// Estados para Toast e Modal
	const [toast, setToast] = useState(null);
	const [confirmModal, setConfirmModal] = useState(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Estados para etapas
	const [showEtapaForm, setShowEtapaForm] = useState(false);
	const [novaEtapa, setNovaEtapa] = useState({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], formularios: [], isEdit: false, etapaId: null });
	const [salvandoEtapa, setSalvandoEtapa] = useState(false);
	const [showDeleteEtapaModal, setShowDeleteEtapaModal] = useState(false);
	const [etapaToDelete, setEtapaToDelete] = useState(null);
	const [excluindo, setExcluindo] = useState(false);
	const [erroExclusao, setErroExclusao] = useState(null);
	const [errosArquivosEtapa, setErrosArquivosEtapa] = useState([]);

	// Estados para submenus
	const [showSubmenuForm, setShowSubmenuForm] = useState(false);
	const [submenuData, setSubmenuData] = useState({ etapaId: null, titulo: "", descricao: "", arquivos: [], produtos: [], formularios: [], isEdit: false, submenuId: null });
	const [salvandoSubmenu, setSalvandoSubmenu] = useState(false);

	// Dados auxiliares
	const [decisoesDisponiveis, setDecisoesDisponiveis] = useState([]);
	const [loadingDecisoes, setLoadingDecisoes] = useState(false);
	const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
	const [loadingProdutos, setLoadingProdutos] = useState(false);
	const [formulariosDisponiveis, setFormulariosDisponiveis] = useState([]);
	const [loadingFormularios, setLoadingFormularios] = useState(false);

	// Função para resetar o formulário
	const resetarFormulario = () => {
		setTitulo("");
		setDescricao("");
		setOrdem(null);
		setGoToSelecionados([]);
		setFormulariosTrilha([]);
		setArquivos([]);
		setIsEditingTrilha(false);
		setTrilhaEditId(null);
		setFormKey(prev => prev + 1); // Força remontagem completa
	};

	// Configuração do drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Função para lidar com o fim do arrasto
	const handleDragEnd = async (event) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const oldIndex = trilhas.findIndex((t) => t.id === active.id);
		const newIndex = trilhas.findIndex((t) => t.id === over.id);

		if (oldIndex === -1 || newIndex === -1) return;

		// Reordenar localmente
		const reordenadas = arrayMove(trilhas, oldIndex, newIndex);

		// Atualizar ordens no backend
		try {
			const promises = reordenadas.map((trilha, index) => 
				atualizarTrilha(trilha.id, { ordem: index + 1 })
			);
			await Promise.all(promises);
		} catch (error) {
			console.error("Erro ao atualizar ordem:", error);
		}
	};

	useEffect(() => {
		const buscarDecisoes = async () => {
			try {
				setLoadingDecisoes(true);
				const response = await fetch(`${API_BASE_URL}/decisoes/all`);
				if (response.ok) {
					const data = await response.json();
					setDecisoesDisponiveis(data);
				}
			} catch (err) {
				console.error('Erro ao buscar decisões:', err);
			} finally {
				setLoadingDecisoes(false);
			}
		};
		buscarDecisoes();
	}, []);

	useEffect(() => {
		const buscarProdutos = async () => {
			try {
				setLoadingProdutos(true);
				const response = await fetch(`${API_BASE_URL}/produtos`);
				if (response.ok) {
					const data = await response.json();
					setProdutosDisponiveis(data);
				}
			} catch (err) {
				console.error('Erro ao buscar produtos:', err);
			} finally {
				setLoadingProdutos(false);
			}
		};
		buscarProdutos();
	}, []);

	useEffect(() => {
		const buscarFormularios = async () => {
			try {
				setLoadingFormularios(true);
				const data = await FormularioService.listar();
				setFormulariosDisponiveis(data);
			} catch (err) {
				console.error('Erro ao buscar formulários:', err);
			} finally {
				setLoadingFormularios(false);
			}
		};
		buscarFormularios();
	}, []);

	const toggleNode = (nodeId) => {
		setExpandedNodes(prev => ({
			...prev,
			[nodeId]: !prev[nodeId]
		}));
	};

	const handleEditTrilha = (trilhaId) => {
		const trilha = trilhas.find(t => t.id == trilhaId);
		
		if (!trilha) {
			setToast({ message: "Erro: Trilha não encontrada", type: "error" });
			return;
		}

		// Atualizar todos os estados e incrementar formKey para forçar remontagem
		setTitulo(trilha.nome || "");
		setDescricao(trilha.descricao || "");
		setOrdem(trilha.ordem || null);
		setGoToSelecionados(trilha.goTo ? trilha.goTo.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []);
		setFormulariosTrilha(trilha.formularios ? trilha.formularios.map(f => typeof f === 'object' ? f.id : f) : []);
		setArquivos(trilha.documentos || []);
		setIsEditingTrilha(true);
		setTrilhaEditId(trilhaId);
		setFormKey(prev => prev + 1);
		setShowForm(true);
	};

	const salvarTrilha = async () => {
		if (!titulo.trim()) {
			setToast({ message: "Por favor, preencha o título da trilha", type: "error" });
			return;
		}

		setIsSaving(true);
		try {
			const dados = {
				titulo: titulo.trim(),
				descricao: descricao.trim(),
				ordem: ordem || null,
				go_to: goToSelecionados.length > 0 ? goToSelecionados.join(',') : null,
				formularios: formulariosTrilha,
				arquivos: arquivos.filter(a => a instanceof File)
			};

			if (isEditingTrilha) {
				await atualizarTrilha(trilhaEditId, dados, arquivos.filter(a => a instanceof File));
				await FormularioService.sincronizarFormulariosDecisao(trilhaEditId, formulariosTrilha);
				setToast({ message: "Trilha atualizada com sucesso!", type: "success" });
			} else {
				const trilhaCriada = await adicionarTrilha(dados);
				if (trilhaCriada?.id && formulariosTrilha.length > 0) {
					await FormularioService.sincronizarFormulariosDecisao(trilhaCriada.id, formulariosTrilha);
				}
				setToast({ message: "Trilha cadastrada com sucesso!", type: "success" });
			}

			resetarFormulario();
			setShowForm(false);
		} catch {
			setToast({ message: "Erro ao salvar trilha", type: "error" });
		} finally {
			setIsSaving(false);
		}
	};

	const excluirTrilha = async (id) => {
		setConfirmModal({
			title: "Excluir Trilha",
			message: "Tem certeza que deseja excluir esta trilha? Todas as etapas também serão removidas.",
			onConfirm: async () => {
				setIsDeleting(true);
				try {
					await excluirTrilhaAPI(id);
					setToast({ message: "Trilha excluída com sucesso!", type: "success" });
					setConfirmModal(null);
				} catch {
					setToast({ message: "Erro ao excluir trilha", type: "error" });
				} finally {
					setIsDeleting(false);
				}
			}
		});
	};

	const handleAddEtapa = (trilhaId, parentId) => {
		const trilha = trilhas.find(t => t.id === trilhaId);
		let proximaOrdem = 1;

		if (trilha) {
			if (parentId === null) {
				const etapasPrincipais = trilha.etapas?.filter(e => e.id_pai === trilhaId) || [];
				const ordens = etapasPrincipais.map(e => e.ordem || 0).filter(o => o > 0);
				if (ordens.length > 0) proximaOrdem = Math.max(...ordens) + 1;
			} else {
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
					if (ordens.length > 0) proximaOrdem = Math.max(...ordens) + 1;
				}
			}
		}

		setNovaEtapa({ trilhaId, parentId, titulo: "", descricao: "", ordem: proximaOrdem, arquivos: [], goTo: [], produtos: [], isEdit: false, etapaId: null });
		setShowEtapaForm(true);
	};

	const handleEditEtapa = async (trilhaId, etapa) => {
		const goToArray = etapa.goTo ? etapa.goTo.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
		const produtosArray = etapa.produtos ? etapa.produtos.map((p, index) => ({
			produto_id: p.produto_id || p.id,
			recomendado: p.recomendado || false,
			ordem: p.ordem || index
		})) : [];

		let formulariosArray = etapa.formularios
			? etapa.formularios.map(f => typeof f === 'object' ? f.id : f)
			: [];

		try {
			const formulariosAtuais = await FormularioService.listarPorDecisao(etapa.id);
			formulariosArray = formulariosAtuais.map(f => f.id);
		} catch {
			// mantém o fallback acima
		}

		setNovaEtapa({
			trilhaId,
			parentId: etapa.parentId || null,
			titulo: etapa.titulo,
			descricao: etapa.descricao,
			ordem: etapa.ordem !== null && etapa.ordem !== undefined ? etapa.ordem : null,
			arquivos: etapa.anexos || [],
			goTo: goToArray,
			produtos: produtosArray,
			formularios: formulariosArray,
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

		if (salvandoEtapa) return;

		const trilha = trilhas.find(t => t.id === novaEtapa.trilhaId);
		if (!trilha) return;

		try {
			setSalvandoEtapa(true);

			if (novaEtapa.isEdit) {
				const arquivosNovos = novaEtapa.arquivos.filter(a => a instanceof File);
				const documentosExistentes = novaEtapa.arquivos.filter(a => !(a instanceof File));

				const dadosAtualizacao = {
					descricao: novaEtapa.descricao,
					titulo: novaEtapa.titulo,
					ordem: novaEtapa.ordem,
					produtos: novaEtapa.produtos || [],
					formularios: novaEtapa.formularios || [],
					documentos_manter: documentosExistentes.filter(doc => doc.id).map(doc => doc.id)
				};

				if (!novaEtapa.parentId) {
					dadosAtualizacao.go_to = novaEtapa.goTo && novaEtapa.goTo.length > 0 ? novaEtapa.goTo.join(',') : '';
				}

				await atualizarTrilha(novaEtapa.etapaId, dadosAtualizacao, arquivosNovos);
				await FormularioService.sincronizarFormulariosDecisao(novaEtapa.etapaId, novaEtapa.formularios || []);
				setShowEtapaForm(false);
				setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], formularios: [], isEdit: false, etapaId: null });
				setToast({ message: "Etapa atualizada com sucesso!", type: "success" });
				return;
			}

			const arquivosNovos = novaEtapa.arquivos.filter(a => a instanceof File);
			const idPai = novaEtapa.parentId === null ? trilha.id : novaEtapa.parentId;

			const novoDado = {
				descricao: novaEtapa.descricao,
				titulo: novaEtapa.titulo,
				ordem: novaEtapa.ordem,
				id_pai: idPai,
				arquivos: arquivosNovos,
				produtos: novaEtapa.produtos || [],
				formularios: novaEtapa.formularios || []
			};

			if (novaEtapa.parentId === null) {
				novoDado.go_to = novaEtapa.goTo && novaEtapa.goTo.length > 0 ? novaEtapa.goTo.join(',') : '';
			}

			const etapaCriada = await adicionarTrilha(novoDado);
			if (etapaCriada?.id && novaEtapa.formularios?.length > 0) {
				await FormularioService.sincronizarFormulariosDecisao(etapaCriada.id, novaEtapa.formularios);
			}

			setShowEtapaForm(false);
			setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], formularios: [], isEdit: false, etapaId: null });
			setErrosArquivosEtapa([]);
			setToast({ message: "Etapa adicionada com sucesso!", type: "success" });

			if (novaEtapa.parentId) {
				setExpandedNodes(prev => ({ ...prev, [novaEtapa.parentId]: true }));
			}
		} catch (error) {
			console.error('Erro ao salvar etapa:', error);
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

	const confirmarExclusaoEtapa = async () => {
		if (!etapaToDelete) return;
		const { etapaId } = etapaToDelete;
		setExcluindo(true);

		try {
			await excluirTrilhaAPI(etapaId);
			setShowDeleteEtapaModal(false);
			setEtapaToDelete(null);
			setToast({ message: "Etapa excluída com sucesso!", type: "success" });
		} catch (err) {
			let mensagemErro = err.message;
			if (err.message.includes('decisões filhas') || err.message.includes('decis')) {
				mensagemErro = "Não é possível excluir esta etapa pois ela possui sub-etapas vinculadas.";
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

	const handleAddSubmenu = (etapaId) => {
		setSubmenuData({ etapaId, titulo: "", descricao: "", arquivos: [], produtos: [], isEdit: false, submenuId: null });
		setShowSubmenuForm(true);
	};

	const handleEditSubmenu = async (etapaId, submenu) => {
		const produtosArray = submenu.produtos ? submenu.produtos.map((p, index) => ({
			produto_id: p.produto_id || p.id,
			recomendado: p.recomendado || false,
			ordem: p.ordem || index
		})) : [];

		let formulariosArray = submenu.formularios
			? submenu.formularios.map(f => typeof f === 'object' ? f.id : f)
			: [];

		try {
			const formulariosAtuais = await FormularioService.listarPorSubmenu(submenu.id);
			formulariosArray = formulariosAtuais.map(f => f.id);
		} catch {
			// mantém o fallback acima
		}

		setSubmenuData({
			etapaId,
			titulo: submenu.titulo,
			descricao: submenu.descricao,
			arquivos: submenu.anexos || [],
			produtos: produtosArray,
			formularios: formulariosArray,
			isEdit: true,
			submenuId: submenu.id
		});
		setShowSubmenuForm(true);
	};

	const handleRemoveSubmenu = async (submenuId) => {
		if (!confirm('Deseja realmente excluir este submenu?')) return;

		try {
			const response = await fetch(`${API_BASE_URL}/submenus/${submenuId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Erro ao excluir submenu');
			await carregarTrilhas();
			setToast({ message: "Submenu excluído com sucesso!", type: "success" });
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
			const formData = new FormData();

			formData.append('decisao_id', submenuData.etapaId);
			formData.append('titulo', submenuData.titulo);
			formData.append('descricao', submenuData.descricao || '');

			if (submenuData.produtos && submenuData.produtos.length > 0) {
				submenuData.produtos.forEach((produto, index) => {
					formData.append(`produtos[${index}][produto_id]`, produto.produto_id);
					formData.append(`produtos[${index}][recomendado]`, produto.recomendado ? 1 : 0);
					formData.append(`produtos[${index}][ordem]`, produto.ordem || index);
				});
			}

			(submenuData.formularios || []).forEach((id, index) => {
				formData.append(`formularios[${index}]`, id);
			});

			const arquivosNovos = submenuData.arquivos.filter(a => a instanceof File);
			arquivosNovos.forEach(arquivo => formData.append('arquivos[]', arquivo));

			if (submenuData.isEdit) {
				const documentosExistentes = submenuData.arquivos.filter(a => !(a instanceof File));
				documentosExistentes.forEach((doc, index) => {
					if (doc.id) formData.append(`documentos_manter[${index}]`, doc.id);
				});
			}

			const url = submenuData.isEdit
				? `${API_BASE_URL}/submenus/${submenuData.submenuId}`
				: `${API_BASE_URL}/submenus`;

			const response = await fetch(url, { method: 'POST', body: formData });
			if (!response.ok) throw new Error('Erro ao salvar submenu');

			const saved = await response.json();
			const submenuId = submenuData.isEdit ? submenuData.submenuId : saved.id;

			await FormularioService.sincronizarFormulariosSubmenu(submenuId, submenuData.formularios || []);

			setShowSubmenuForm(false);
			setSubmenuData({ etapaId: null, titulo: "", descricao: "", arquivos: [], produtos: [], formularios: [], isEdit: false, submenuId: null });
			await carregarTrilhas();
			setToast({ message: submenuData.isEdit ? "Submenu atualizado com sucesso!" : "Submenu adicionado com sucesso!", type: "success" });
		} catch (error) {
			console.error('Erro ao salvar submenu:', error);
			alert('Erro ao salvar submenu. Tente novamente.');
		} finally {
			setSalvandoSubmenu(false);
		}
	};

	const handleDeleteDocumento = async (etapaId, documentoId, nomeDocumento) => {
		if (!confirm(`Deseja realmente excluir o documento "${nomeDocumento}"?`)) return;

		try {
			const response = await fetch(`${API_BASE_URL}/decisoes/${etapaId}/documentos/${documentoId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Erro ao excluir documento');
			await carregarTrilhas();
			setToast({ message: "Documento excluído com sucesso!", type: "success" });
		} catch (error) {
			console.error('Erro ao excluir documento:', error);
			alert('Erro ao excluir documento. Tente novamente.');
		}
	};

	const handleDeleteDocumentoSubmenu = async (submenuId, documentoId, nomeDocumento) => {
		if (!confirm(`Deseja realmente excluir o documento "${nomeDocumento}"?`)) return;

		try {
			const response = await fetch(`${API_BASE_URL}/submenus/${submenuId}/documentos/${documentoId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Erro ao excluir documento do submenu');
			await carregarTrilhas();
			setToast({ message: "Documento do submenu excluído com sucesso!", type: "success" });
		} catch (error) {
			console.error('Erro ao excluir documento do submenu:', error);
			alert('Erro ao excluir documento do submenu. Tente novamente.');
		}
	};

	const handleDeleteDocumentoTrilhaForm = async (documentoId, nomeDocumento) => {
		if (!confirm(`Deseja realmente excluir o documento "${nomeDocumento}"?`)) return;

		try {
			const response = await fetch(`${API_BASE_URL}/decisoes/${trilhaEditId}/documentos/${documentoId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Erro ao excluir documento');
			setArquivos(prev => prev.filter(a => a.id !== documentoId));
			setToast({ message: "Documento excluído com sucesso!", type: "success" });
		} catch (error) {
			console.error('Erro ao excluir documento da trilha:', error);
			alert('Erro ao excluir documento. Tente novamente.');
		}
	};

	const handleDeleteDocumentoEtapaForm = async (documentoId, nomeDocumento) => {
		if (!confirm(`Deseja realmente excluir o documento "${nomeDocumento}"?`)) return;

		try {
			const response = await fetch(`${API_BASE_URL}/decisoes/${novaEtapa.etapaId}/documentos/${documentoId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Erro ao excluir documento');
			setNovaEtapa(prev => ({ ...prev, arquivos: prev.arquivos.filter(a => a.id !== documentoId) }));
		} catch (error) {
			console.error('Erro ao excluir documento:', error);
			alert('Erro ao excluir documento. Tente novamente.');
		}
	};

	const handleDeleteDocumentoSubmenuForm = async (documentoId, nomeDocumento) => {
		if (!confirm(`Deseja realmente excluir o documento "${nomeDocumento}"?`)) return;

		try {
			const response = await fetch(`${API_BASE_URL}/submenus/${submenuData.submenuId}/documentos/${documentoId}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Erro ao excluir documento do submenu');
			setSubmenuData(prev => ({ ...prev, arquivos: prev.arquivos.filter(a => a.id !== documentoId) }));
		} catch (error) {
			console.error('Erro ao excluir documento do submenu:', error);
			alert('Erro ao excluir documento do submenu. Tente novamente.');
		}
	};

	// Filtrar trilhas pela busca
	const trilhasFiltradas = trilhas.filter(trilha =>
		trilha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
		trilha.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<MenuSuperior />
			
			{/* Toast Notification */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{/* Confirm Modal */}
			{confirmModal && (
				<ConfirmModal
					isOpen={true}
					onClose={() => setConfirmModal(null)}
					onConfirm={confirmModal.onConfirm}
					title={confirmModal.title}
					message={confirmModal.message}
					isLoading={isDeleting}
					danger={true}
					confirmText="Sim, Excluir"
				/>
			)}
			
			<main className="pt-14 px-4 md:px-8 pb-12">
				<div className="max-w-7xl mx-auto">
					{/* Mensagens de Erro */}
					{error && (
						<div className="mb-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
							<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
							<p className="text-red-800">{error}</p>
						</div>
					)}

					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-6">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Cadastro de Trilhas</h1>
								{trilhas.length > 0 && (
									<span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
										{trilhas.length}
									</span>
								)}
							</div>
							<p className="text-gray-600">Gerencie suas trilhas de vendas e etapas</p>
						</div>
						<button
							onClick={() => {
								if (showForm) {
									// Cancelar - fechar e limpar
									setShowForm(false);
									resetarFormulario();
								} else {
									// Abrir novo formulário - garantir que está limpo
									resetarFormulario();
									setShowForm(true);
								}
							}}
							disabled={isSaving}
							className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Plus className="w-5 h-5" />
							{showForm ? "Cancelar" : "Nova Trilha"}
						</button>
					</div>

					{/* Formulário */}
					{showForm && (
						<div className="mb-8 animate-in slide-in-from-top duration-300">
							<TrilhaForm
								key={formKey}
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
								decisoesDisponiveis={[]}
								loadingDecisoes={false}
								formulariosSelecionados={formulariosTrilha}
								setFormulariosSelecionados={setFormulariosTrilha}
								formulariosDisponiveis={formulariosDisponiveis}
								loadingFormularios={loadingFormularios}
								onSave={salvarTrilha}
								onCancel={() => {
									setShowForm(false);
									resetarFormulario();
								}}
								isEditing={isEditingTrilha}
								isSaving={isSaving}
								onDeleteDocumento={isEditingTrilha ? handleDeleteDocumentoTrilhaForm : undefined}
							/>
						</div>
					)}

					{/* Lista de Trilhas */}
					<div>
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
							<h2 className="text-2xl font-bold text-gray-900">Trilhas Cadastradas</h2>
							
							<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
								{/* Campo de Busca */}
								{trilhas.length > 0 && (
									<div className="relative flex-1 sm:w-64">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
										<input
											type="text"
											placeholder="Buscar trilhas..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
										/>
									</div>
								)}
								
								{/* View Modes */}
								<div className="flex gap-2">
									<button 
										onClick={() => setViewMode('grid')}
										title="Visualização em grade"
										className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
											viewMode === 'grid' 
												? 'bg-red-500 text-white'
												: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
										}`}
									>
										<Grid3x3 className="w-4 h-4" />
									</button>
									<button 
										onClick={() => setViewMode('lista')}
										title="Visualização em lista"
										className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
											viewMode === 'lista' 
												? 'bg-red-500 text-white'
												: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
										}`}
									>
										<List className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
						
						{loading ? (
							<div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
								<Loader2 className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-spin" />
								<p className="text-lg text-gray-600">Carregando trilhas...</p>
							</div>
						) : trilhasFiltradas.length === 0 ? (
							<div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
								<FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
								{searchTerm ? (
									<>
										<p className="text-lg text-gray-600">Nenhuma trilha encontrada para "{searchTerm}"</p>
										<p className="text-sm mt-2 text-gray-500">Tente buscar por outro termo</p>
									</>
								) : (
									<>
										<p className="text-lg text-gray-600 mb-4">Nenhuma trilha cadastrada ainda.</p>
										<button
											onClick={() => {
												resetarFormulario();
												setShowForm(true);
											}}
											className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-all"
										>
											<Plus className="w-5 h-5" />
											Criar Primeira Trilha
										</button>
									</>
								)}
							</div>
						) : viewMode === 'grid' ? (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={trilhasFiltradas.map(t => t.id)}
									strategy={rectSortingStrategy}
								>
									<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
										{trilhasFiltradas.map((trilha) => (
											<TrilhaCard
												key={trilha.id}
												trilha={trilha}
												onViewTree={setExpandedTrilha}
												onEdit={handleEditTrilha}
												onDelete={excluirTrilha}
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>
						) : (
							<div className="space-y-3">
								{trilhasFiltradas.map((trilha) => (
									<div
										key={trilha.id}
										className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
									>
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<h3 className="text-lg font-bold text-gray-900 mb-1">{trilha.nome}</h3>
												<div className="flex items-center gap-4 text-xs text-gray-600">
													<span className="flex items-center gap-1">
														<FileText className="w-3 h-3" />
														{trilha.etapas?.length || 0} etapas
													</span>
												</div>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() => setExpandedTrilha(trilha.id)}
													className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
												>
													Ver Árvore
												</button>
												<button 
													onClick={() => handleEditTrilha(trilha.id)}
													className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
												>
													Editar
												</button>
												<button
													onClick={() => excluirTrilha(trilha.id)}
													className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
												>
													Excluir
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Modal de Visualização */}
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
						onDeleteDocumento={handleDeleteDocumento}
						onDeleteDocumentoSubmenu={handleDeleteDocumentoSubmenu}
						onReload={carregarTrilhas}
					/>

					{/* Modal de Adicionar/Editar Etapa */}
					{showEtapaForm && (
						<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => { setShowEtapaForm(false); setErrosArquivosEtapa([]); }}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full max-h-[90vh] overflow-y-auto p-6 ${theme.bg.card} ${theme.border.card}`} onClick={(e) => e.stopPropagation()}>
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
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} transition-all`}
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
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} transition-all resize-none`}
										/>
									</div>

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<Hash className="w-4 h-4" />
											Ordem
										</label>
										<input
											type="number"
											min="1"
											value={novaEtapa.ordem || ""}
											onChange={(e) => setNovaEtapa({ ...novaEtapa, ordem: e.target.value ? parseInt(e.target.value) : null })}
											placeholder="Ex: 1"
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} transition-all`}
										/>
									</div>

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<Package className="w-4 h-4" />
											Produtos/Serviços
										</label>
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
																onClick={() => setNovaEtapa({ ...novaEtapa, produtos: novaEtapa.produtos.filter((_, i) => i !== idx) })}
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
										<select
											value=""
											onChange={(e) => {
												if (e.target.value) {
													const novoProduto = { produto_id: parseInt(e.target.value), recomendado: false, ordem: novaEtapa.produtos.length };
													setNovaEtapa({ ...novaEtapa, produtos: [...novaEtapa.produtos, novoProduto] });
												}
											}}
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} transition-all`}
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
									</div>

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<ClipboardList className="w-4 h-4" />
											Formulários
										</label>
										{novaEtapa.formularios.length > 0 && (
											<div className="mb-2 space-y-1">
												{novaEtapa.formularios.map((formId) => {
													const form = formulariosDisponiveis.find(f => f.id === formId);
													return (
														<div key={formId} className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
															<span className={`font-semibold truncate flex-1 ${theme.text.primary}`}>{form?.titulo || `Formulário #${formId}`}</span>
															<button
																onClick={() => setNovaEtapa({ ...novaEtapa, formularios: novaEtapa.formularios.filter(id => id !== formId) })}
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
										<select
											value=""
											onChange={(e) => {
												if (e.target.value) {
													setNovaEtapa({ ...novaEtapa, formularios: [...novaEtapa.formularios, parseInt(e.target.value)] });
												}
											}}
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} transition-all`}
											disabled={salvandoEtapa || loadingFormularios}
										>
											<option value="">+ Adicionar formulário</option>
											{formulariosDisponiveis
												.filter(f => !novaEtapa.formularios.includes(f.id))
												.map((form) => (
													<option key={form.id} value={form.id}>
														{form.titulo}{form.descricao ? ` — ${form.descricao}` : ''}
													</option>
												))}
										</select>
									</div>

									{!novaEtapa.parentId && (
										<div>
											<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
												<CheckSquare className="w-4 h-4" />
												Go To - Próximas Decisões
											</label>
											{(novaEtapa.goTo || []).length > 0 && (
												<div className="mb-3 space-y-1">
													{(novaEtapa.goTo || []).map((decisaoId, index) => {
														const decisao = decisoesDisponiveis.find(d => d.id === decisaoId);
														if (!decisao) return null;
														return (
															<div key={decisaoId} className={`flex items-center gap-2 p-2 border rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-600/50' : 'bg-blue-50 border-blue-300'}`}>
																<GripVertical className={`w-4 h-4 ${theme.text.tertiary} flex-shrink-0`} />
																<div className={`flex items-center justify-center w-6 h-6 rounded-md ${isDarkMode ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-200 text-blue-700'} font-bold text-xs flex-shrink-0`}>
																	{index + 1}
																</div>
																<div className="flex-1 min-w-0">
																	<p className={`font-medium text-xs ${theme.text.primary} truncate`}>{decisao.titulo}</p>
																</div>
																<div className="flex items-center gap-1 flex-shrink-0">
																	<button
																		onClick={() => {
																			if (index === 0) return;
																			const newGoTo = [...novaEtapa.goTo];
																			[newGoTo[index - 1], newGoTo[index]] = [newGoTo[index], newGoTo[index - 1]];
																			setNovaEtapa({ ...novaEtapa, goTo: newGoTo });
																		}}
																		disabled={index === 0 || salvandoEtapa}
																		className={`p-1 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : isDarkMode ? 'hover:bg-blue-600/30 text-blue-400' : 'hover:bg-blue-200 text-blue-700'}`}
																	>
																		<ArrowUp className="w-3 h-3" />
																	</button>
																	<button
																		onClick={() => {
																			if (index === novaEtapa.goTo.length - 1) return;
																			const newGoTo = [...novaEtapa.goTo];
																			[newGoTo[index], newGoTo[index + 1]] = [newGoTo[index + 1], newGoTo[index]];
																			setNovaEtapa({ ...novaEtapa, goTo: newGoTo });
																		}}
																		disabled={index === novaEtapa.goTo.length - 1 || salvandoEtapa}
																		className={`p-1 rounded ${index === novaEtapa.goTo.length - 1 ? 'opacity-30 cursor-not-allowed' : isDarkMode ? 'hover:bg-blue-600/30 text-blue-400' : 'hover:bg-blue-200 text-blue-700'}`}
																	>
																		<ArrowDown className="w-3 h-3" />
																	</button>
																	<button
																		onClick={() => setNovaEtapa({ ...novaEtapa, goTo: novaEtapa.goTo.filter(id => id !== decisaoId) })}
																		disabled={salvandoEtapa}
																		className={`p-1 rounded ${isDarkMode ? 'hover:bg-red-600/30 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
																	>
																		<X className="w-3 h-3" />
																	</button>
																</div>
															</div>
														);
													})}
												</div>
											)}
											{loadingDecisoes ? (
												<p className={`text-xs ${theme.text.tertiary}`}>Carregando...</p>
											) : decisoesDisponiveis.length > 0 ? (
												<div className={`border rounded-xl ${theme.bg.input} ${theme.border.input} max-h-40 overflow-y-auto`}>
													{decisoesDisponiveis
														.filter(decisao => !(novaEtapa.goTo || []).includes(decisao.id))
														.map((decisao) => (
															<div
																key={decisao.id}
																onClick={() => setNovaEtapa({ ...novaEtapa, goTo: [...(novaEtapa.goTo || []), decisao.id] })}
																className={`p-2.5 border-b last:border-b-0 cursor-pointer ${isDarkMode ? 'border-slate-700 hover:bg-slate-700/30' : 'border-gray-200 hover:bg-gray-100'}`}
															>
																<div className="flex items-start gap-2">
																	<Square className={`w-4 h-4 ${theme.text.tertiary} mt-0.5`} />
																	<p className={`font-medium text-xs ${theme.text.primary}`}>{decisao.titulo}</p>
																</div>
															</div>
														))}
												</div>
											) : (
												<p className={`text-xs ${theme.text.tertiary}`}>Nenhuma decisão disponível</p>
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
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.secondary} file:bg-red-50 file:text-red-700 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer`}
											disabled={salvandoEtapa}
										/>
										{errosArquivosEtapa.length > 0 && (
											<div className={`mt-3 p-3 rounded-xl ${isDarkMode ? 'bg-red-900/20 border border-red-600/50' : 'bg-red-50 border border-red-200'}`}>
												<div className="flex items-start gap-2">
													<AlertCircle className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0`} />
													<ul className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'} space-y-1`}>
														{errosArquivosEtapa.map((erro, index) => (
															<li key={index}><span className="font-medium">{erro.nome}</span> — {erro.erro}</li>
														))}
													</ul>
												</div>
											</div>
										)}
										{novaEtapa.arquivos.length > 0 && (
											<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
												{novaEtapa.arquivos.map((arquivo, i) => {
													const isFile = arquivo instanceof File;
													const isImage = isFile ? arquivo.type?.startsWith('image/') : arquivo.tipo?.startsWith('image/') || arquivo.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
													const nome = isFile ? arquivo.name : arquivo.nome;
													const imageUrl = isFile && isImage ? URL.createObjectURL(arquivo) : (isImage && arquivo.url_presignada) || null;

													return (
														<div key={i} className={`relative border rounded-xl p-3 ${isFile ? (isDarkMode ? 'bg-green-900/20 border-green-600/50' : 'bg-green-50 border-green-300') : (isDarkMode ? 'bg-blue-900/20 border-blue-600/50' : 'bg-gray-100 border-gray-300')}`}>
															{isImage && imageUrl ? (
																<div className="space-y-2">
																	<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5">
																		<img src={imageUrl} alt={nome} className="w-full h-full object-cover" onLoad={() => isFile && URL.revokeObjectURL(imageUrl)} />
																	</div>
																	<div className="flex items-center justify-between gap-2">
																		<div className="flex items-center gap-2 flex-1 min-w-0">
																			<ImageIcon className={`w-4 h-4 flex-shrink-0 ${isFile ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-blue-400' : 'text-gray-700')}`} />
																			<span className={`text-xs truncate ${theme.text.secondary}`}>{nome}</span>
																		</div>
																		<button
																			type="button"
																			onClick={async (e) => {
																				e.preventDefault();
																				e.stopPropagation();
																				if (!isFile && arquivo.id) {
																					await handleDeleteDocumentoEtapaForm(arquivo.id, nome);
																				} else {
																					setNovaEtapa({ ...novaEtapa, arquivos: novaEtapa.arquivos.filter((_, index) => index !== i) });
																				}
																			}}
																			className={`flex-shrink-0 p-1.5 rounded-lg ${isDarkMode ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
																			disabled={salvandoEtapa}
																		>
																			<X className="w-4 h-4" />
																		</button>
																	</div>
																</div>
															) : (
																<div className="flex items-center gap-2">
																	<FileText className={`w-4 h-4 flex-shrink-0 ${isFile ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-blue-400' : 'text-gray-700')}`} />
																	<span className={`text-xs truncate flex-1 ${theme.text.secondary}`}>{nome}</span>
																	{!isFile && <span className={`text-[10px] ${isDarkMode ? 'text-blue-300' : 'text-gray-600'}`}>(salvo)</span>}
																	<button
																		type="button"
																		onClick={async (e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			if (!isFile && arquivo.id) {
																				await handleDeleteDocumentoEtapaForm(arquivo.id, nome);
																			} else {
																				setNovaEtapa({ ...novaEtapa, arquivos: novaEtapa.arquivos.filter((_, index) => index !== i) });
																			}
																		}}
																		className={`flex-shrink-0 p-1.5 rounded-lg ${isDarkMode ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
																		disabled={salvandoEtapa}
																	>
																		<X className="w-4 h-4" />
																	</button>
																</div>
															)}
														</div>
													);
												})}
											</div>
										)}
									</div>
								</div>

								<div className="flex gap-3 mt-6">
									<button
										onClick={salvarNovaEtapa}
										disabled={salvandoEtapa}
										className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
									>
										{salvandoEtapa ? (
											<><Loader2 className="w-4 h-4 animate-spin" />{novaEtapa.isEdit ? "Salvando..." : "Adicionando..."}</>
										) : (
											novaEtapa.isEdit ? "Salvar" : "Adicionar"
										)}
									</button>
									<button
										onClick={() => { setShowEtapaForm(false); setNovaEtapa({ trilhaId: null, parentId: null, titulo: "", descricao: "", ordem: null, arquivos: [], goTo: [], produtos: [], formularios: [], isEdit: false, etapaId: null }); }}
										disabled={salvandoEtapa}
										className={`px-4 py-2 font-semibold rounded-xl ${theme.bg.button} ${theme.text.secondary} ${theme.hover} transition-all disabled:opacity-50`}
									>
										Cancelar
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Modal de Confirmação de Exclusão de Etapa */}
					{showDeleteEtapaModal && (
						<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={cancelarExclusaoEtapa}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full p-6 ${theme.bg.card} ${theme.border.card}`} onClick={(e) => e.stopPropagation()}>
								<div className="flex justify-center mb-4">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'} animate-pulse`}>
										<AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
									</div>
								</div>
								<h3 className={`text-xl font-bold text-center mb-3 ${theme.text.primary}`}>Confirmar Exclusão de Etapa</h3>
								<p className={`text-center mb-2 ${theme.text.secondary}`}>Tem certeza que deseja excluir esta etapa?</p>
								<p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
									⚠️ Todas as sub-etapas também serão removidas permanentemente!
								</p>
								<div className="flex gap-3">
									<button onClick={cancelarExclusaoEtapa} disabled={excluindo} className={`flex-1 px-4 py-3 font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} disabled:opacity-50`}>
										Cancelar
									</button>
									<button onClick={confirmarExclusaoEtapa} disabled={excluindo} className="flex-1 px-4 py-3 font-semibold rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
										{excluindo ? <><Loader2 className="w-4 h-4 animate-spin" />Excluindo...</> : 'Sim, Excluir'}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Modal de Erro de Exclusão */}
					{erroExclusao && (
						<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setErroExclusao(null)}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full p-6 ${theme.bg.card} ${theme.border.card}`} onClick={(e) => e.stopPropagation()}>
								<div className="flex justify-center mb-4">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
										<AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
									</div>
								</div>
								<h3 className={`text-xl font-bold text-center mb-3 ${theme.text.primary}`}>Não foi possível excluir</h3>
								<div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'}`}>
									<p className={`text-center text-sm ${isDarkMode ? 'text-orange-200' : 'text-orange-800'}`}>{erroExclusao}</p>
								</div>
								<button onClick={() => setErroExclusao(null)} className="w-full px-4 py-3 font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white">
									Entendi
								</button>
							</div>
						</div>
					)}

					{/* Modal de Cadastro de Submenu */}
					{showSubmenuForm && (
						<div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowSubmenuForm(false)}>
							<div className={`rounded-2xl shadow-2xl border max-w-md w-full max-h-[90vh] overflow-y-auto p-6 ${theme.bg.card} ${theme.border.card}`} onClick={(e) => e.stopPropagation()}>
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
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} transition-all`}
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
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.placeholder.input} transition-all resize-none`}
										/>
									</div>

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<Package className="w-4 h-4" />
											Produtos/Serviços
										</label>
										{submenuData.produtos && submenuData.produtos.length > 0 && (
											<div className="mb-3 space-y-2">
												{submenuData.produtos.map((prod, idx) => {
													const produtoInfo = produtosDisponiveis.find(p => p.id === prod.produto_id);
													return (
														<div key={idx} className={`flex items-center justify-between p-2 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
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
																<span className={`text-xs ${theme.text.secondary}`}>Recomendar <strong>{produtoInfo?.nome}</strong></span>
															</label>
															<button
																onClick={() => setSubmenuData({ ...submenuData, produtos: submenuData.produtos.filter((_, i) => i !== idx) })}
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
										<select
											value=""
											onChange={(e) => {
												if (e.target.value) {
													const novoProduto = { produto_id: parseInt(e.target.value), recomendado: false, ordem: submenuData.produtos.length };
													setSubmenuData({ ...submenuData, produtos: [...submenuData.produtos, novoProduto] });
												}
											}}
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} transition-all`}
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

									<div>
										<label className={`block font-semibold mb-2 text-sm ${theme.text.secondary} flex items-center gap-2`}>
											<ClipboardList className="w-4 h-4" />
											Formulários
										</label>
										{submenuData.formularios.length > 0 && (
											<div className="mb-2 space-y-1">
												{submenuData.formularios.map((formId) => {
													const form = formulariosDisponiveis.find(f => f.id === formId);
													return (
														<div key={formId} className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
															<span className={`font-semibold truncate flex-1 ${theme.text.primary}`}>{form?.titulo || `Formulário #${formId}`}</span>
															<button
																onClick={() => setSubmenuData({ ...submenuData, formularios: submenuData.formularios.filter(id => id !== formId) })}
																className={`p-1 rounded flex-shrink-0 ${isDarkMode ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
																disabled={salvandoSubmenu}
															>
																<X className="w-3 h-3" />
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
													setSubmenuData({ ...submenuData, formularios: [...submenuData.formularios, parseInt(e.target.value)] });
												}
											}}
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.primary} transition-all`}
											disabled={salvandoSubmenu || loadingFormularios}
										>
											<option value="">+ Adicionar formulário</option>
											{formulariosDisponiveis
												.filter(f => !submenuData.formularios.includes(f.id))
												.map((form) => (
													<option key={form.id} value={form.id}>
														{form.titulo}{form.descricao ? ` — ${form.descricao}` : ''}
													</option>
												))}
										</select>
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
											className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 focus:ring-red-100 ${theme.bg.input} ${theme.border.input} ${theme.text.secondary} file:bg-red-50 file:text-red-700 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer`}
											disabled={salvandoSubmenu}
										/>
										{submenuData.arquivos.length > 0 && (
											<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
												{submenuData.arquivos.map((arquivo, i) => {
													const isFile = arquivo instanceof File;
													const isImage = isFile ? arquivo.type?.startsWith('image/') : arquivo.tipo?.startsWith('image/') || arquivo.nome?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
													const nome = isFile ? arquivo.name : arquivo.nome;
													const imageUrl = isFile && isImage ? URL.createObjectURL(arquivo) : (isImage && arquivo.url_presignada) || null;

													return (
														<div key={i} className={`relative border rounded-xl p-3 ${isFile ? (isDarkMode ? 'bg-green-900/20 border-green-600/50' : 'bg-green-50 border-green-300') : (isDarkMode ? 'bg-blue-900/20 border-blue-600/50' : 'bg-gray-100 border-gray-300')}`}>
															{isImage && imageUrl ? (
																<div className="space-y-2">
																	<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/5">
																		<img src={imageUrl} alt={nome} className="w-full h-full object-cover" onLoad={() => isFile && URL.revokeObjectURL(imageUrl)} />
																	</div>
																	<div className="flex items-center justify-between gap-2">
																		<div className="flex items-center gap-2 flex-1 min-w-0">
																			<ImageIcon className={`w-4 h-4 flex-shrink-0 ${isFile ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-blue-400' : 'text-gray-700')}`} />
																			<span className={`text-xs truncate ${theme.text.secondary}`}>{nome}</span>
																		</div>
																		<button
																			type="button"
																			onClick={async (e) => {
																				e.preventDefault();
																				e.stopPropagation();
																				if (!isFile && arquivo.id) {
																					await handleDeleteDocumentoSubmenuForm(arquivo.id, nome);
																				} else {
																					setSubmenuData({ ...submenuData, arquivos: submenuData.arquivos.filter((_, index) => index !== i) });
																				}
																			}}
																			className={`flex-shrink-0 p-1.5 rounded-lg ${isDarkMode ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
																			disabled={salvandoSubmenu}
																		>
																			<X className="w-4 h-4" />
																		</button>
																	</div>
																</div>
															) : (
																<div className="flex items-center gap-2">
																	<FileText className={`w-4 h-4 flex-shrink-0 ${isFile ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-blue-400' : 'text-gray-700')}`} />
																	<span className={`text-xs truncate flex-1 ${theme.text.secondary}`}>{nome}</span>
																	{!isFile && <span className={`text-[10px] ${isDarkMode ? 'text-blue-300' : 'text-gray-600'}`}>(salvo)</span>}
																	<button
																		type="button"
																		onClick={async (e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			if (!isFile && arquivo.id) {
																				await handleDeleteDocumentoSubmenuForm(arquivo.id, nome);
																			} else {
																				setSubmenuData({ ...submenuData, arquivos: submenuData.arquivos.filter((_, index) => index !== i) });
																			}
																		}}
																		className={`flex-shrink-0 p-1.5 rounded-lg ${isDarkMode ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
																		disabled={salvandoSubmenu}
																	>
																		<X className="w-4 h-4" />
																	</button>
																</div>
															)}
														</div>
													);
												})}
											</div>
										)}
									</div>
								</div>

								<div className="flex gap-3 mt-6">
									<button
										onClick={salvarSubmenu}
										disabled={salvandoSubmenu}
										className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
									>
										{salvandoSubmenu ? (
											<><Loader2 className="w-4 h-4 animate-spin" />{submenuData.isEdit ? "Salvando..." : "Adicionando..."}</>
										) : (
											submenuData.isEdit ? "Salvar" : "Adicionar"
										)}
									</button>
									<button
										onClick={() => { setShowSubmenuForm(false); setSubmenuData({ etapaId: null, titulo: "", descricao: "", arquivos: [], produtos: [], formularios: [], isEdit: false, submenuId: null }); }}
										disabled={salvandoSubmenu}
										className={`px-4 py-2 font-semibold rounded-xl ${theme.bg.button} ${theme.text.secondary} ${theme.hover} transition-all disabled:opacity-50`}
									>
										Cancelar
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
