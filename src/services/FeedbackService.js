import API_BASE_URL from '../config/api';

const FeedbackService = {
	async enviarFeedback({ gostou, comentario }) {
		try {
			const response = await fetch(`${API_BASE_URL}/feedbacks`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ gostou, comentario }),
			});

			if (!response.ok) {
				throw new Error('Erro ao enviar feedback');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao enviar feedback:', error);
			throw error;
		}
	},

	async buscarFeedbacks(gostou) {
		try {
			const query = gostou === undefined ? '' : `?gostou=${gostou ? 1 : 0}`;
			const response = await fetch(`${API_BASE_URL}/feedbacks${query}`);
			if (!response.ok) {
				throw new Error('Erro ao buscar feedbacks');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao buscar feedbacks:', error);
			throw error;
		}
	},

	async excluirFeedback(id) {
		try {
			const response = await fetch(`${API_BASE_URL}/feedbacks/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Erro ao excluir feedback');
			}
			return true;
		} catch (error) {
			console.error('Erro ao excluir feedback:', error);
			throw error;
		}
	},
};

export default FeedbackService;
