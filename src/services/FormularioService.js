import API_BASE_URL from '../config/api';

const FormularioService = {
  async listar() {
    const res = await fetch(`${API_BASE_URL}/formularios`);
    if (!res.ok) throw new Error('Erro ao buscar formulários');
    return res.json();
  },

  async listarPorDecisao(decisaoId) {
    const res = await fetch(`${API_BASE_URL}/decisoes/${decisaoId}/formularios`);
    if (!res.ok) throw new Error('Erro ao buscar formulários da decisão');
    return res.json();
  },

  async listarPorSubmenu(submenuId) {
    const res = await fetch(`${API_BASE_URL}/submenus/${submenuId}/formularios`);
    if (!res.ok) throw new Error('Erro ao buscar formulários do submenu');
    return res.json();
  },

  async criar(data) {
    const res = await fetch(`${API_BASE_URL}/formularios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao criar formulário');
    }
    return res.json();
  },

  async atualizar(id, data) {
    const res = await fetch(`${API_BASE_URL}/formularios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar formulário');
    return res.json();
  },

  async excluir(id) {
    const res = await fetch(`${API_BASE_URL}/formularios/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir formulário');
    return res.json();
  },

  async adicionarPergunta(formularioId, texto, ordem) {
    const res = await fetch(`${API_BASE_URL}/formularios/${formularioId}/perguntas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, ordem }),
    });
    if (!res.ok) throw new Error('Erro ao adicionar pergunta');
    return res.json();
  },

  async atualizarPergunta(id, data) {
    const res = await fetch(`${API_BASE_URL}/perguntas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar pergunta');
    return res.json();
  },

  async excluirPergunta(id) {
    const res = await fetch(`${API_BASE_URL}/perguntas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir pergunta');
    return res.json();
  },

  async reordenarPerguntas(formularioId, perguntas) {
    const res = await fetch(`${API_BASE_URL}/formularios/${formularioId}/perguntas/reordenar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perguntas }),
    });
    if (!res.ok) throw new Error('Erro ao reordenar perguntas');
    return res.json();
  },

  async associarSubmenu(submenuId, formularioId) {
    const res = await fetch(`${API_BASE_URL}/submenus/${submenuId}/formularios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formulario_id: formularioId }),
    });
    if (res.status === 409) return;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao associar formulário ao submenu');
    }
    return res.json();
  },

  async desassociarSubmenu(submenuId, formularioId) {
    const res = await fetch(`${API_BASE_URL}/submenus/${submenuId}/formularios/${formularioId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao desassociar formulário do submenu');
    return res.json();
  },

  async sincronizarFormulariosSubmenu(submenuId, idsSelecionados) {
    const atuais = await this.listarPorSubmenu(submenuId);
    const idsAtuais = atuais.map(f => f.id);

    const aRemover = idsAtuais.filter(id => !idsSelecionados.includes(id));
    const aAdicionar = idsSelecionados.filter(id => !idsAtuais.includes(id));

    await Promise.all([
      ...aRemover.map(id => this.desassociarSubmenu(submenuId, id)),
      ...aAdicionar.map(id => this.associarSubmenu(submenuId, id)),
    ]);
  },

  async associarDecisao(decisaoId, formularioId) {
    const res = await fetch(`${API_BASE_URL}/decisoes/${decisaoId}/formularios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formulario_id: formularioId }),
    });
    if (res.status === 409) return;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao associar formulário à decisão');
    }
    return res.json();
  },

  async desassociarDecisao(decisaoId, formularioId) {
    const res = await fetch(`${API_BASE_URL}/decisoes/${decisaoId}/formularios/${formularioId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao desassociar formulário da decisão');
    return res.json();
  },

  async sincronizarFormulariosDecisao(decisaoId, idsSelecionados) {
    const atuais = await this.listarPorDecisao(decisaoId);
    const idsAtuais = atuais.map(f => f.id);

    const aRemover = idsAtuais.filter(id => !idsSelecionados.includes(id));
    const aAdicionar = idsSelecionados.filter(id => !idsAtuais.includes(id));

    await Promise.all([
      ...aRemover.map(id => this.desassociarDecisao(decisaoId, id)),
      ...aAdicionar.map(id => this.associarDecisao(decisaoId, id)),
    ]);
  },
};

export default FormularioService;
