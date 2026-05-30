
import { Edit, Trash2, Maximize2, FileText, Image, Menu, Package, GripVertical } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TrilhaCard({ trilha, onViewTree, onEdit, onDelete }) {
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
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div 
			ref={setNodeRef}
			style={style}
			className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all ${isDragging ? 'z-50 opacity-50' : ''}`}
		>
			{/* Header do Card */}
			<div className="border-b border-gray-200 p-4 bg-gray-50">
				<div className="flex items-start justify-between mb-2">
					{/* Handle para arrastar */}
					<div 
						{...attributes} 
						{...listeners}
						className="mr-2 mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 transition-colors"
						title="Arrastar para reordenar"
					>
						<GripVertical className="w-5 h-5" />
					</div>
					<div className="flex-1">
						<h3 className="text-lg font-bold mb-1 line-clamp-2 text-gray-900">{trilha.nome}</h3>
						<div className="flex items-center gap-3 text-xs text-gray-600">
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
									<span className="flex items-center gap-1 text-gray-700 font-semibold">
										<Menu className="w-3 h-3" />
										{totalSubmenus}
									</span>
								) : null;
							})()}
						</div>
					</div>
					<div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
						<span className="text-white font-bold text-lg">{trilha.etapas?.length || 0}</span>
					</div>
				</div>
			</div>

			{/* Preview das Etapas */}
			<div className="p-4">
				<div className="space-y-2 mb-4">
					{(trilha.etapas || []).slice(0, 2).map((etapa, index) => (
						<div key={etapa.id} className="flex items-start gap-2 text-sm">
							<div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold text-xs flex-shrink-0 mt-0.5">
								{index + 1}
							</div>
							<div className="flex-1 min-w-0">
								<span className="block truncate font-medium text-gray-900">{etapa.titulo}</span>
								{etapa.subEtapas && etapa.subEtapas.length > 0 && (
									<span className="text-xs text-gray-600">↳ {etapa.subEtapas.length} sub-etapas</span>
								)}
							</div>
						</div>
					))}
					{(trilha.etapas?.length || 0) > 2 && (
						<p className="text-xs pl-8 text-gray-600">+ {trilha.etapas.length - 2} etapas</p>
					)}
				</div>

				{/* Ações */}
				<div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
					<button
						onClick={() => onViewTree(trilha.id)}
						className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
					>
						<Maximize2 className="w-4 h-4" />
						Ver Árvore
					</button>
					<div className="flex gap-2">
						<button 
							onClick={() => onEdit(trilha.id)}
							className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs font-medium"
							title="Editar trilha"
						>
							<Edit className="w-3.5 h-3.5" />
							<span className="hidden sm:inline">Editar</span>
						</button>
						<button
							onClick={() => onDelete(trilha.id)}
							className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all text-xs font-medium"
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