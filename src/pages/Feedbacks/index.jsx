import React, { useMemo } from "react";
import MenuSuperior from "../MenuSuperior";
import { MessageSquareHeart, Loader2, AlertCircle, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useFeedbacks } from "../../hooks/useFeedbacks";
import { useTheme } from "../../contexts/ThemeContext";

const FILTROS = [
	{ value: undefined, label: "Todos" },
	{ value: true, label: "Gostei" },
	{ value: false, label: "Não gostei" },
];

function formatarData(data) {
	if (!data) return "-";
	return new Date(data).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function Feedbacks() {
	const { feedbacks, loading, error, filtroGostou, setFiltroGostou, carregarFeedbacks, excluirFeedback } = useFeedbacks();
	const { theme, isDarkMode } = useTheme();

	const stats = useMemo(() => {
		const total = feedbacks.length;
		const positivos = feedbacks.filter((f) => f.gostou).length;
		const negativos = total - positivos;
		const percentualPositivo = total > 0 ? Math.round((positivos / total) * 100) : 0;
		return { total, positivos, negativos, percentualPositivo };
	}, [feedbacks]);

	const handleFiltroChange = (value) => {
		setFiltroGostou(value);
		carregarFeedbacks(value);
	};

	const handleExcluir = async (id) => {
		if (!confirm("Deseja realmente excluir este feedback?")) return;
		try {
			await excluirFeedback(id);
		} catch {
			alert("Erro ao excluir feedback");
		}
	};

	return (
		<div className={`min-h-screen ${theme.bg.primary} transition-colors duration-300`}>
			<MenuSuperior />

			<div className="container mx-auto px-6 py-8 pt-28">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
					<div>
						<h1 className={`text-3xl font-bold ${theme.text.primary} flex items-center gap-3`}>
							<MessageSquareHeart className="w-8 h-8" />
							Feedbacks
						</h1>
						<p className={`mt-2 ${theme.text.secondary}`}>
							Opiniões enviadas pelos usuários sobre o Playbook
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<div className={`rounded-2xl p-5 ${theme.shadow.card} ${theme.bg.card} ${theme.border.card} border`}>
						<p className={`text-sm font-semibold ${theme.text.tertiary}`}>Total de feedbacks</p>
						<p className={`text-3xl font-bold mt-1 ${theme.text.primary}`}>{stats.total}</p>
					</div>
					<div className={`rounded-2xl p-5 ${theme.shadow.card} ${theme.bg.card} ${theme.border.card} border`}>
						<p className={`text-sm font-semibold ${theme.text.tertiary} flex items-center gap-2`}>
							<ThumbsUp className="w-4 h-4" /> Gostaram
						</p>
						<p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.positivos}</p>
					</div>
					<div className={`rounded-2xl p-5 ${theme.shadow.card} ${theme.bg.card} ${theme.border.card} border`}>
						<p className={`text-sm font-semibold ${theme.text.tertiary} flex items-center gap-2`}>
							<ThumbsDown className="w-4 h-4" /> Não gostaram
						</p>
						<p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{stats.negativos}</p>
					</div>
				</div>

				<div className="flex items-center gap-2 mb-6">
					{FILTROS.map((filtro) => {
						const ativo = filtroGostou === filtro.value;
						return (
							<button
								key={filtro.label}
								onClick={() => handleFiltroChange(filtro.value)}
								className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
									ativo
										? isDarkMode
											? 'bg-blue-600/30 border-blue-500 text-blue-400'
											: 'bg-gray-800 border-gray-800 text-white'
										: isDarkMode
											? 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50'
											: 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
								}`}
							>
								{filtro.label}
							</button>
						);
					})}
				</div>

				<div className={`rounded-2xl ${theme.shadow.card} ${theme.bg.card} ${theme.border.card} border overflow-hidden`}>
					{loading ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Loader2 className={`w-12 h-12 animate-spin ${theme.text.tertiary}`} />
							<p className={`mt-4 ${theme.text.secondary}`}>Carregando feedbacks...</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-12">
							<AlertCircle className={`w-12 h-12 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
							<p className={`mt-4 ${theme.text.primary} font-semibold`}>Erro ao carregar feedbacks</p>
							<p className={`mt-2 ${theme.text.secondary}`}>{error}</p>
							<button
								onClick={() => carregarFeedbacks()}
								className={`mt-4 px-6 py-2 rounded-lg ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'} text-white transition-all`}
							>
								Tentar novamente
							</button>
						</div>
					) : feedbacks.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<MessageSquareHeart className={`w-16 h-16 ${theme.text.tertiary}`} />
							<p className={`mt-4 ${theme.text.primary} font-semibold text-lg`}>Nenhum feedback encontrado</p>
							<p className={`mt-2 ${theme.text.secondary}`}>Ainda não há feedbacks para este filtro</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className={`${isDarkMode ? 'bg-slate-800/80' : 'bg-gray-100'} border-b ${theme.border.card}`}>
									<tr>
										<th className={`px-6 py-4 text-left text-sm font-bold ${theme.text.primary}`}>Avaliação</th>
										<th className={`px-6 py-4 text-left text-sm font-bold ${theme.text.primary}`}>Comentário</th>
										<th className={`px-6 py-4 text-left text-sm font-bold ${theme.text.primary}`}>Data</th>
										<th className={`px-6 py-4 text-center text-sm font-bold ${theme.text.primary}`}>Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y" style={{ borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(229, 231, 235, 1)' }}>
									{feedbacks.map((feedback) => (
										<tr
											key={feedback.id}
											className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50'}`}
										>
											<td className="px-6 py-4">
												<div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
													feedback.gostou
														? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
														: isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
												}`}>
													{feedback.gostou ? <ThumbsUp className="w-3.5 h-3.5" /> : <ThumbsDown className="w-3.5 h-3.5" />}
													<span className="text-xs font-semibold">{feedback.gostou ? 'Gostou' : 'Não gostou'}</span>
												</div>
											</td>
											<td className={`px-6 py-4 ${theme.text.secondary} max-w-md`}>
												{feedback.comentario ? (
													<p className="whitespace-pre-wrap">{feedback.comentario}</p>
												) : (
													<span className={theme.text.tertiary}>Sem comentário</span>
												)}
											</td>
											<td className={`px-6 py-4 text-sm ${theme.text.secondary} whitespace-nowrap`}>
												{formatarData(feedback.created_at)}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-center">
													<button
														onClick={() => handleExcluir(feedback.id)}
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
			</div>
		</div>
	);
}
