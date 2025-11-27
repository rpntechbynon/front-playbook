import API_BASE_URL from '../config/api';

// Serviço para gerenciar trilhas de vendas (decisões)
const TrilhaService = {
	// Buscar todas as trilhas
	async buscarTrilhas() {
		try {
			const response = await fetch(`${API_BASE_URL}/decisoes`);
			if (!response.ok) {
				throw new Error('Erro ao buscar trilhas');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao buscar trilhas:', error);
			throw error;
		}
	},

	// Buscar uma trilha específica por ID
	async buscarTrilhaPorId(id) {
		try {
			const response = await fetch(`${API_BASE_URL}/decisoes/${id}`);
			if (!response.ok) {
				throw new Error('Erro ao buscar trilha');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao buscar trilha:', error);
			throw error;
		}
	},

	// Criar uma nova trilha
	async criarTrilha(dados) {
		try {
			const formData = new FormData();
			
			// Adicionar campos obrigatórios
			if (dados.descricao) {
				formData.append('descricao', dados.descricao);
			}
			
			// Adicionar titulo se fornecido
			if (dados.titulo) {
				formData.append('titulo', dados.titulo);
			}
			
			// Adicionar id_pai se fornecido
			if (dados.id_pai) {
				formData.append('id_pai', dados.id_pai);
				console.log('Enviando id_pai:', dados.id_pai);
			}
			
			// Adicionar go_to se fornecido
			if (dados.go_to) {
				formData.append('go_to', dados.go_to);
			}
			
			// Adicionar arquivos se fornecidos
			if (dados.arquivos && dados.arquivos.length > 0) {
				console.log('Enviando arquivos:', dados.arquivos.length);
				dados.arquivos.forEach((arquivo, index) => {
					formData.append('arquivos[]', arquivo);
					console.log(`Arquivo ${index}:`, arquivo.name, arquivo.type);
				});
			}

			console.log('Criando decisão/etapa com dados:', {
				descricao: dados.descricao,
				titulo: dados.titulo,
				id_pai: dados.id_pai,
				arquivos: dados.arquivos?.length || 0
			});

			const response = await fetch(`${API_BASE_URL}/decisoes`, {
				method: 'POST',
				body: formData,
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Erro da API:', errorText);
				throw new Error('Erro ao criar trilha');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao criar trilha:', error);
			throw error;
		}
	},

	// Atualizar uma trilha existente
	async atualizarTrilha(id, dados) {
		try {
			const formData = new FormData();
			
			// Laravel precisa do _method para simular PUT com FormData
			formData.append('_method', 'PUT');
			
			// Adicionar descrição
			if (dados.descricao) {
				formData.append('descricao', dados.descricao);
			}
			
			// Adicionar titulo se fornecido
			if (dados.titulo) {
				formData.append('titulo', dados.titulo);
			}
			
			// Adicionar go_to (IDs separados por vírgula)
			if (dados.go_to) {
				formData.append('go_to', dados.go_to);
			}
			
			// Adicionar arquivos (se houver)
			if (dados.arquivos && dados.arquivos.length > 0) {
				console.log('Enviando arquivos:', dados.arquivos.length);
				dados.arquivos.forEach((arquivo, index) => {
					console.log(`Arquivo ${index}:`, arquivo.name, arquivo.type);
					formData.append('arquivos[]', arquivo);
				});
			}

			// Usar POST com _method PUT para suportar FormData
			const response = await fetch(`${API_BASE_URL}/decisoes/${id}`, {
				method: 'POST',
				body: formData,
				// Não definir Content-Type - o navegador define automaticamente com boundary
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Erro da API:', errorText);
				throw new Error('Erro ao atualizar trilha');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao atualizar trilha:', error);
			throw error;
		}
	},

	// Excluir uma trilha
	async excluirTrilha(id) {
		try {
			const response = await fetch(`${API_BASE_URL}/decisoes/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Erro ao excluir trilha');
			}
			return await response.json();
		} catch (error) {
			console.error('Erro ao excluir trilha:', error);
			throw error;
		}
	},

	// Transformar dados da API para o formato da aplicação
	transformarParaFormato(apiData) {
		return apiData.map(item => ({
			id: item.id,
			nome: item.descricao,
			titulo: item.titulo,
			descricao: item.descricao,
			id_pai: item.id_pai,
			idPai: item.id_pai,
			go_to: item.go_to,
			goTo: item.go_to,
			created_at: item.created_at,
			updated_at: item.updated_at,
			criadoEm: item.created_at,
			atualizadoEm: item.updated_at,
			documentos: item.documentos ? item.documentos.map(doc => ({
				id: doc.id,
				nome: doc.nome,
				caminho: doc.caminho,
				tipo: doc.tipo,
				url: doc.url_presignada || doc.caminho,
				url_presignada: doc.url_presignada
			})) : [],
			all_children: this.transformarEtapas(item.all_children),
			etapas: this.transformarEtapas(item.all_children),
		}));
	},

	// Transformar etapas (filhos) recursivamente
	transformarEtapas(children) {
		if (!children || children.length === 0) return [];
		
		return children.map(child => ({
			id: child.id,
			titulo: child.titulo || child.descricao,
			descricao: child.descricao,
			id_pai: child.id_pai,
			idPai: child.id_pai,
			go_to: child.go_to,
			goTo: child.go_to,
			created_at: child.created_at,
			updated_at: child.updated_at,
			documentos: child.documentos ? child.documentos.map(doc => ({
				id: doc.id,
				nome: doc.nome,
				caminho: doc.caminho,
				tipo: doc.tipo,
				url: doc.url_presignada || doc.caminho,
				url_presignada: doc.url_presignada
			})) : [],
			anexos: child.documentos ? child.documentos.map(doc => ({
				id: doc.id,
				nome: doc.nome,
				caminho: doc.caminho,
				tipo: doc.tipo,
				url: doc.url_presignada || doc.caminho,
				url_presignada: doc.url_presignada
			})) : [],
			all_children: this.transformarEtapas(child.all_children),
			subEtapas: this.transformarEtapas(child.all_children),
		}));
	},

	// Transformar dados do formato da aplicação para API
	transformarParaAPI(appData) {
		return {
			descricao: appData.nome || appData.descricao || appData.titulo,
			titulo: appData.titulo || null,
			id_pai: appData.id_pai || null,
			go_to: appData.go_to || appData.goTo || null,
			arquivos: appData.arquivos || [],
		};
	},

	// Preparar dados para atualização com etapas aninhadas
	prepararDadosAtualizacao(etapa, arquivosNovos = []) {
		// Se go_to foi fornecido explicitamente, usar ele
		// Caso contrário, extrair IDs das sub-etapas (comportamento antigo para compatibilidade)
		let goToValue = '';
		
		if (etapa.go_to !== undefined && etapa.go_to !== null) {
			// go_to explícito fornecido (pode ser string ou vazio)
			goToValue = etapa.go_to;
		} else if (etapa.subEtapas && etapa.subEtapas.length > 0) {
			// Fallback: extrair das sub-etapas
			goToValue = etapa.subEtapas.map(sub => sub.id).join(',');
		}

		return {
			descricao: etapa.descricao || etapa.titulo,
			titulo: etapa.titulo || null,
			go_to: goToValue,
			arquivos: arquivosNovos,
		};
	},
};

export default TrilhaService;
