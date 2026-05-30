import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmModal({ 
	isOpen, 
	onClose, 
	onConfirm, 
	title = "Confirmar ação",
	message = "Tem certeza que deseja continuar?",
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	isLoading = false,
	danger = false
}) {
	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div 
				className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Ícone */}
				<div className="flex justify-center mb-4">
					<div className={`w-16 h-16 rounded-full flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-gray-100'}`}>
						<AlertTriangle className={`w-8 h-8 ${danger ? 'text-red-600' : 'text-gray-600'}`} />
					</div>
				</div>

				{/* Título */}
				<h3 className="text-xl font-bold text-center mb-3 text-gray-900">
					{title}
				</h3>

				{/* Mensagem */}
				<p className="text-center mb-6 text-gray-600">
					{message}
				</p>

				{/* Botões */}
				<div className="flex gap-3">
					<button
						onClick={onClose}
						disabled={isLoading}
						className="flex-1 px-4 py-3 font-semibold rounded-lg transition-all bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-all text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
							danger 
								? 'bg-red-500 hover:bg-red-600' 
								: 'bg-gray-800 hover:bg-gray-900'
						}`}
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Processando...
							</>
						) : (
							confirmText
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
