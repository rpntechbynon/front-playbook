import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, CheckCircle2, Loader2, MessageSquareHeart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import FeedbackService from '../services/FeedbackService';

const STATUS = {
	IDLE: 'idle',
	SENDING: 'sending',
	SUCCESS: 'success',
	ERROR: 'error',
};

export default function FeedbackWidget() {
	const { isDarkMode } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [gostou, setGostou] = useState(null);
	const [comentario, setComentario] = useState('');
	const [status, setStatus] = useState(STATUS.IDLE);

	const resetAndClose = () => {
		setIsOpen(false);
		setTimeout(() => {
			setGostou(null);
			setComentario('');
			setStatus(STATUS.IDLE);
		}, 200);
	};

	const handleEnviar = async () => {
		if (gostou === null) return;

		setStatus(STATUS.SENDING);
		try {
			await FeedbackService.enviarFeedback({ gostou, comentario: comentario.trim() || null });
			setStatus(STATUS.SUCCESS);
			setTimeout(resetAndClose, 2200);
		} catch {
			setStatus(STATUS.ERROR);
		}
	};

	const panelBg = isDarkMode
		? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
		: 'bg-white border-gray-200';
	const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
	const textMuted = isDarkMode ? 'text-slate-400' : 'text-gray-500';
	const inputBg = isDarkMode
		? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
		: 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400';

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
			{isOpen && (
				<div
					className={`w-80 max-w-[calc(100vw-3rem)] rounded-2xl border shadow-2xl p-5 origin-bottom-right animate-feedback-pop ${panelBg}`}
				>
					{status === STATUS.SUCCESS ? (
						<div className="flex flex-col items-center text-center py-4 gap-2">
							<CheckCircle2 className="w-10 h-10 text-green-500" />
							<p className={`font-semibold ${textPrimary}`}>Obrigado pelo feedback!</p>
							<p className={`text-sm ${textMuted}`}>Sua opinião nos ajuda a melhorar.</p>
						</div>
					) : (
						<>
							<div className="flex items-start justify-between mb-4">
								<div>
									<p className={`font-semibold ${textPrimary}`}>O que você achou?</p>
									<p className={`text-xs ${textMuted}`}>Sua opinião sobre o Playbook</p>
								</div>
								<button
									onClick={resetAndClose}
									aria-label="Fechar"
									className={`p-1 rounded-lg hover:bg-black/5 ${textMuted}`}
								>
									<X className="w-4 h-4" />
								</button>
							</div>

							<div className="flex gap-3 mb-4">
								<button
									onClick={() => setGostou(true)}
									className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
										gostou === true
											? 'border-green-500 bg-green-500/10 text-green-500'
											: `border-transparent ${inputBg} ${textMuted} hover:opacity-80`
									}`}
								>
									<ThumbsUp className="w-5 h-5" />
									<span className="text-xs font-medium">Gostei</span>
								</button>
								<button
									onClick={() => setGostou(false)}
									className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
										gostou === false
											? 'border-red-500 bg-red-500/10 text-red-500'
											: `border-transparent ${inputBg} ${textMuted} hover:opacity-80`
									}`}
								>
									<ThumbsDown className="w-5 h-5" />
									<span className="text-xs font-medium">Não gostei</span>
								</button>
							</div>

							<textarea
								value={comentario}
								onChange={(e) => setComentario(e.target.value)}
								placeholder="Conte mais sobre sua experiência (opcional)"
								rows={3}
								maxLength={500}
								className={`w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 transition-all ${inputBg}`}
							/>

							{status === STATUS.ERROR && (
								<p className="text-xs text-red-500 mt-2">
									Não foi possível enviar. Tente novamente.
								</p>
							)}

							<button
								onClick={handleEnviar}
								disabled={gostou === null || status === STATUS.SENDING}
								className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
							>
								{status === STATUS.SENDING ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Enviando...
									</>
								) : (
									'Enviar feedback'
								)}
							</button>
						</>
					)}
				</div>
			)}

			<div className="relative group">
				{!isOpen && (
					<span
						className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg opacity-0 scale-95 origin-right transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 ${
							isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gray-900 text-white'
						}`}
					>
						Deixe seu feedback
						<span
							className={`absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent ${
								isDarkMode ? 'border-l-slate-800' : 'border-l-gray-900'
							}`}
						/>
					</span>
				)}
				<button
					onClick={() => setIsOpen((prev) => !prev)}
					aria-label="Dar feedback"
					className={`w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
						!isOpen ? 'animate-feedback-attention' : ''
					}`}
				>
					{isOpen ? <X className="w-6 h-6" /> : <MessageSquareHeart className="w-6 h-6" />}
				</button>
			</div>
		</div>
	);
}
