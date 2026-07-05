import API_BASE_URL from '../config/api';
import { authHeaders } from '../utils/auth';

const RespostaService = {
	// Salvar (ou continuar) as respostas de um atendimento
	async salvarRespostas(formularioId, { cpfCliente, nomeCliente, respostaId, finalizar, respostas, userId, userNome }) {
		try {
			const response = await fetch(`${API_BASE_URL}/formularios/${formularioId}/respostas`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...authHeaders(),
				},
				body: JSON.stringify({
					cpf_cliente: cpfCliente,
					nome_cliente: nomeCliente || undefined,
					resposta_id: respostaId ?? undefined,
					finalizar: Boolean(finalizar),
					respostas,
					user_id: userId ?? undefined,
					user_nome: userNome ?? undefined,
				}),
			});

			if (!response.ok) {
				throw new Error('Erro ao salvar respostas');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao salvar respostas:', error);
			throw error;
		}
	},

	// Listar atendimentos pendentes (em andamento) de um cliente
	async listarPendentes({ cpfCliente, userId }) {
		try {
			const params = new URLSearchParams();
			if (cpfCliente) params.set('cpf_cliente', cpfCliente);
			if (userId) params.set('user_id', userId);

			const response = await fetch(`${API_BASE_URL}/respostas/pendentes?${params.toString()}`, {
				headers: authHeaders(),
			});
			if (!response.ok) {
				throw new Error('Erro ao buscar atendimentos pendentes');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao buscar atendimentos pendentes:', error);
			throw error;
		}
	},

	// Finalizar um atendimento sem reenviar respostas
	async finalizar(respostaId) {
		try {
			const response = await fetch(`${API_BASE_URL}/respostas/${respostaId}/finalizar`, {
				method: 'PUT',
				headers: authHeaders(),
			});
			if (!response.ok) {
				throw new Error('Erro ao finalizar atendimento');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao finalizar atendimento:', error);
			throw error;
		}
	},
};

export default RespostaService;
