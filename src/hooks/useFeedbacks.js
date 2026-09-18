import { useState, useEffect, useCallback } from 'react';
import FeedbackService from '../services/FeedbackService';

export function useFeedbacks() {
	const [feedbacks, setFeedbacks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filtroGostou, setFiltroGostou] = useState(undefined);

	const carregarFeedbacks = useCallback(async (gostou = filtroGostou) => {
		try {
			setLoading(true);
			setError(null);
			const data = await FeedbackService.buscarFeedbacks(gostou);
			setFeedbacks(data);
		} catch (err) {
			setError(err.message);
			console.error('Erro ao carregar feedbacks:', err);
		} finally {
			setLoading(false);
		}
	}, [filtroGostou]);

	useEffect(() => {
		carregarFeedbacks();
	}, [carregarFeedbacks]);

	const excluirFeedback = async (id) => {
		try {
			await FeedbackService.excluirFeedback(id);
			setFeedbacks(prev => prev.filter(feedback => feedback.id !== id));
		} catch (err) {
			setError(err.message);
			throw err;
		}
	};

	return {
		feedbacks,
		loading,
		error,
		filtroGostou,
		setFiltroGostou,
		carregarFeedbacks,
		excluirFeedback,
	};
}
