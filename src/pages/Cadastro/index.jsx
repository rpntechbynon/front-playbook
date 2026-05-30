import { useState } from "react";
import MenuSuperior from "../MenuSuperior";
import { Plus, Loader2, AlertCircle, FileText, Grid3x3, List, Search } from "lucide-react";
import { useTrilhas } from "../../hooks/useTrilhas";
import TrilhaForm from "../../components/TrilhaForm";
import TrilhaCard from "../../components/TrilhaCard";
import TrilhaModal from "../../components/TrilhaModal";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
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
	
	const [showForm, setShowForm] = useState(false);
	const [expandedTrilha, setExpandedTrilha] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState({});
	const [titulo, setTitulo] = useState("");
	const [descricao, setDescricao] = useState("");
	const [ordem, setOrdem] = useState(null);
	const [goToSelecionados, setGoToSelecionados] = useState([]);
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

	// Função para resetar o formulário
	const resetarFormulario = () => {
		setTitulo("");
		setDescricao("");
		setOrdem(null);
		setGoToSelecionados([]);
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
		setArquivos([]);
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
				go_to: goToSelecionados.length > 0 ? goToSelecionados.join(',') : null
			};

			if (isEditingTrilha) {
				await atualizarTrilha(trilhaEditId, dados);
				setToast({ message: "Trilha atualizada com sucesso!", type: "success" });
			} else {
				await adicionarTrilha(dados);
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
								onSave={salvarTrilha}
								onCancel={() => {
									setShowForm(false);
									resetarFormulario();
								}}
								isEditing={isEditingTrilha}
								isSaving={isSaving}
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
						onReload={carregarTrilhas}
					/>
				</div>
			</main>
		</div>
	);
}
