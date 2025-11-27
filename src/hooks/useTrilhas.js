import { useState, useEffect } from 'react';
import TrilhaService from '../services/TrilhaService';

// Hook customizado para gerenciar trilhas
export const useTrilhas = () => {
	const [trilhas, setTrilhas] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Carregar trilhas da API
	const carregarTrilhas = async () => {
		setLoading(true);
		setError(null);
		try {
			const dados = await TrilhaService.buscarTrilhas();
			const trilhasFormatadas = TrilhaService.transformarParaFormato(dados);
			setTrilhas(trilhasFormatadas);
		} catch (err) {
			setError(err.message);
			console.error('Erro ao carregar trilhas:', err);
		} finally {
			setLoading(false);
		}
	};

	// Adicionar nova trilha
	const adicionarTrilha = async (novaTrilha) => {
		setLoading(true);
		setError(null);
		try {
			console.log('Dados enviados para criar trilha:', novaTrilha);
			const dadosAPI = TrilhaService.transformarParaAPI(novaTrilha);
			console.log('Dados transformados para API:', dadosAPI);
			const trilhaCriada = await TrilhaService.criarTrilha(dadosAPI);
			await carregarTrilhas(); // Recarregar lista
			return trilhaCriada;
		} catch (err) {
			setError(err.message);
			console.error('Erro ao adicionar trilha:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Atualizar trilha existente
	const atualizarTrilha = async (id, dadosAtualizados, arquivosNovos = []) => {
		setLoading(true);
		setError(null);
		try {
			// Preparar dados para atualização com formato correto
			const dadosAPI = TrilhaService.prepararDadosAtualizacao(dadosAtualizados, arquivosNovos);
			const trilhaAtualizada = await TrilhaService.atualizarTrilha(id, dadosAPI);
			await carregarTrilhas(); // Recarregar lista
			return trilhaAtualizada;
		} catch (err) {
			setError(err.message);
			console.error('Erro ao atualizar trilha:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Excluir trilha
	const excluirTrilha = async (id) => {
		setLoading(true);
		setError(null);
		try {
			await TrilhaService.excluirTrilha(id);
			await carregarTrilhas(); // Recarregar lista
		} catch (err) {
			setError(err.message);
			console.error('Erro ao excluir trilha:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Carregar trilhas ao montar o componente
	useEffect(() => {
		carregarTrilhas();
	}, []);

	return {
		trilhas,
		loading,
		error,
		carregarTrilhas,
		adicionarTrilha,
		atualizarTrilha,
		excluirTrilha,
	};
};
