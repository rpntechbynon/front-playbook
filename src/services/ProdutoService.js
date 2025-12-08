import API_BASE_URL from '../config/api';

const ProdutoService = {
	// Buscar todos os produtos
	async buscarProdutos() {
		try {
			const response = await fetch(`${API_BASE_URL}/produtos`);
			if (!response.ok) {
				throw new Error('Erro ao buscar produtos');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao buscar produtos:', error);
			throw error;
		}
	},

	// Buscar um produto específico por ID
	async buscarProdutoPorId(id) {
		try {
			const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
			if (!response.ok) {
				throw new Error('Erro ao buscar produto');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao buscar produto:', error);
			throw error;
		}
	},

	// Criar um novo produto
	async criarProduto(dados) {
		try {
			const response = await fetch(`${API_BASE_URL}/produtos`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(dados),
			});

			if (!response.ok) {
				throw new Error('Erro ao criar produto');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao criar produto:', error);
			throw error;
		}
	},

	// Atualizar um produto
	async atualizarProduto(id, dados) {
		try {
			const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(dados),
			});

			if (!response.ok) {
				throw new Error('Erro ao atualizar produto');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao atualizar produto:', error);
			throw error;
		}
	},

	// Excluir um produto
	async excluirProduto(id) {
		try {
			const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Erro ao excluir produto');
			}
			return true;
		} catch (error) {
			console.error('Erro ao excluir produto:', error);
			throw error;
		}
	},
};

export default ProdutoService;
