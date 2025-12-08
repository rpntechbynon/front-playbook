import { useState, useEffect } from 'react';
import ProdutoService from '../services/ProdutoService';

export function useProdutos() {
	const [produtos, setProdutos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Carregar produtos ao montar o componente
	useEffect(() => {
		carregarProdutos();
	}, []);

	const carregarProdutos = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await ProdutoService.buscarProdutos();
			setProdutos(data);
		} catch (err) {
			setError(err.message);
			console.error('Erro ao carregar produtos:', err);
		} finally {
			setLoading(false);
		}
	};

	const adicionarProduto = async (dadosProduto) => {
		try {
			const novoProduto = await ProdutoService.criarProduto(dadosProduto);
			setProdutos(prev => [...prev, novoProduto]);
			return novoProduto;
		} catch (err) {
			setError(err.message);
			throw err;
		}
	};

	const atualizarProduto = async (id, dadosProduto) => {
		try {
			const produtoAtualizado = await ProdutoService.atualizarProduto(id, dadosProduto);
			setProdutos(prev =>
				prev.map(produto =>
					produto.id === id ? produtoAtualizado : produto
				)
			);
			return produtoAtualizado;
		} catch (err) {
			setError(err.message);
			throw err;
		}
	};

	const excluirProduto = async (id) => {
		try {
			await ProdutoService.excluirProduto(id);
			setProdutos(prev => prev.filter(produto => produto.id !== id));
		} catch (err) {
			setError(err.message);
			throw err;
		}
	};

	return {
		produtos,
		loading,
		error,
		carregarProdutos,
		adicionarProduto,
		atualizarProduto,
		excluirProduto,
	};
}
