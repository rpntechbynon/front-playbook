import { useState, useEffect } from 'react';
import MenuSuperior from '../MenuSuperior';
import {
  Plus, Loader2, ClipboardList, ChevronDown, ChevronUp,
  Edit2, Trash2, Check, X, FileText,
} from 'lucide-react';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import FormularioService from '../../services/FormularioService';

export default function Formularios() {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingFormulario, setEditingFormulario] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', descricao: '' });
  const [perguntasModal, setPerguntasModal] = useState(['']);
  const [salvando, setSalvando] = useState(false);

  const [editingPergunta, setEditingPergunta] = useState(null);
  const [novaPerguntaFormId, setNovaPerguntaFormId] = useState(null);
  const [novaPerguntaTexto, setNovaPerguntaTexto] = useState('');
  const [savingPergunta, setSavingPergunta] = useState(false);

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const carregarFormularios = async () => {
    setLoading(true);
    try {
      const data = await FormularioService.listar();
      setFormularios(data);
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFormularios();
  }, []);

  const toggleExpanded = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const abrirModalNovo = () => {
    setEditingFormulario(null);
    setFormData({ titulo: '', descricao: '' });
    setPerguntasModal(['']);
    setShowModal(true);
  };

  const abrirModalEditar = (form) => {
    setEditingFormulario(form);
    setFormData({ titulo: form.titulo, descricao: form.descricao || '' });
    setPerguntasModal(['']);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditingFormulario(null);
    setFormData({ titulo: '', descricao: '' });
    setPerguntasModal(['']);
  };

  const salvarFormulario = async () => {
    if (!formData.titulo.trim()) {
      setToast({ message: 'Título é obrigatório', type: 'error' });
      return;
    }
    setSalvando(true);
    try {
      if (editingFormulario) {
        await FormularioService.atualizar(editingFormulario.id, {
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim(),
        });
        setToast({ message: 'Formulário atualizado!', type: 'success' });
      } else {
        const perguntas = perguntasModal
          .map((t, i) => ({ texto: t.trim(), ordem: i }))
          .filter(p => p.texto);
        await FormularioService.criar({
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim() || undefined,
          ...(perguntas.length ? { perguntas } : {}),
        });
        setToast({ message: 'Formulário criado!', type: 'success' });
      }
      fecharModal();
      await carregarFormularios();
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setSalvando(false);
    }
  };

  const excluirFormulario = (form) => {
    setConfirmModal({
      title: 'Excluir Formulário',
      message: `Deseja excluir "${form.titulo}"? Todas as perguntas e associações serão removidas.`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await FormularioService.excluir(form.id);
          setFormularios(prev => prev.filter(f => f.id !== form.id));
          setToast({ message: 'Formulário excluído!', type: 'success' });
          setConfirmModal(null);
        } catch (e) {
          setToast({ message: e.message, type: 'error' });
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const salvarNovaPergunta = async (formularioId) => {
    if (!novaPerguntaTexto.trim()) return;
    const form = formularios.find(f => f.id === formularioId);
    const ordem = form?.perguntas?.length || 0;
    setSavingPergunta(true);
    try {
      const pergunta = await FormularioService.adicionarPergunta(formularioId, novaPerguntaTexto.trim(), ordem);
      setFormularios(prev => prev.map(f =>
        f.id === formularioId ? { ...f, perguntas: [...(f.perguntas || []), pergunta] } : f
      ));
      setNovaPerguntaTexto('');
      setNovaPerguntaFormId(null);
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setSavingPergunta(false);
    }
  };

  const salvarEdicaoPergunta = async (perguntaId, formularioId) => {
    if (!editingPergunta?.texto.trim()) return;
    setSavingPergunta(true);
    try {
      const updated = await FormularioService.atualizarPergunta(perguntaId, { texto: editingPergunta.texto.trim() });
      setFormularios(prev => prev.map(f =>
        f.id === formularioId
          ? { ...f, perguntas: f.perguntas.map(p => p.id === perguntaId ? updated : p) }
          : f
      ));
      setEditingPergunta(null);
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setSavingPergunta(false);
    }
  };

  const excluirPergunta = (perguntaId, formularioId) => {
    setConfirmModal({
      title: 'Excluir Pergunta',
      message: 'Deseja excluir esta pergunta? As respostas vinculadas também serão removidas.',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await FormularioService.excluirPergunta(perguntaId);
          setFormularios(prev => prev.map(f =>
            f.id === formularioId
              ? { ...f, perguntas: f.perguntas.filter(p => p.id !== perguntaId) }
              : f
          ));
          setToast({ message: 'Pergunta excluída!', type: 'success' });
          setConfirmModal(null);
        } catch (e) {
          setToast({ message: e.message, type: 'error' });
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuSuperior />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {confirmModal && (
        <ConfirmModal
          isOpen
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isLoading={isDeleting}
          danger
          confirmText="Sim, Excluir"
        />
      )}

      <main className="pt-14 px-4 md:px-8 pb-12">
        <div className="max-w-5xl mx-auto">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Formulários</h1>
                {formularios.length > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                    {formularios.length}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">Gerencie formulários de perguntas Sim/Não para usar em decisões e submenus</p>
            </div>
            <button
              onClick={abrirModalNovo}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Formulário
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-500 text-sm">Carregando formulários...</p>
            </div>
          ) : formularios.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
              <ClipboardList className="w-14 h-14 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-1">Nenhum formulário cadastrado ainda.</p>
              <p className="text-gray-400 text-sm mb-6">Crie o primeiro formulário para começar.</p>
              <button
                onClick={abrirModalNovo}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Criar Formulário
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {formularios.map(form => (
                <div key={form.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <button
                      onClick={() => toggleExpanded(form.id)}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {expandedIds.has(form.id)
                        ? <ChevronUp className="w-4 h-4 text-gray-500" />
                        : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{form.titulo}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          {form.perguntas?.length || 0} {(form.perguntas?.length || 0) === 1 ? 'pergunta' : 'perguntas'}
                        </span>
                      </div>
                      {form.descricao && (
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{form.descricao}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => abrirModalEditar(form)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirFormulario(form)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  {expandedIds.has(form.id) && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      {(form.perguntas || []).length === 0 && (
                        <p className="text-gray-400 text-xs mb-3">Nenhuma pergunta cadastrada ainda.</p>
                      )}

                      <div className="space-y-1.5 mb-4">
                        {[...(form.perguntas || [])].sort((a, b) => a.ordem - b.ordem).map((p, i) => (
                          <div key={p.id} className="flex items-center gap-2.5 group">
                            <span className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                              {i + 1}
                            </span>

                            {editingPergunta?.id === p.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editingPergunta.texto}
                                  onChange={e => setEditingPergunta({ ...editingPergunta, texto: e.target.value })}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') salvarEdicaoPergunta(p.id, form.id);
                                    if (e.key === 'Escape') setEditingPergunta(null);
                                  }}
                                  className="flex-1 px-3 py-1.5 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                                  autoFocus
                                  disabled={savingPergunta}
                                />
                                <button
                                  onClick={() => salvarEdicaoPergunta(p.id, form.id)}
                                  disabled={savingPergunta}
                                  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingPergunta(null)}
                                  disabled={savingPergunta}
                                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="flex-1 text-sm text-gray-700 truncate">{p.texto}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={() => setEditingPergunta({ id: p.id, texto: p.texto })}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => excluirPergunta(p.id, form.id)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {novaPerguntaFormId === form.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={novaPerguntaTexto}
                            onChange={e => setNovaPerguntaTexto(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') salvarNovaPergunta(form.id);
                              if (e.key === 'Escape') { setNovaPerguntaFormId(null); setNovaPerguntaTexto(''); }
                            }}
                            placeholder="Texto da pergunta..."
                            className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                            autoFocus
                            disabled={savingPergunta}
                          />
                          <button
                            onClick={() => salvarNovaPergunta(form.id)}
                            disabled={!novaPerguntaTexto.trim() || savingPergunta}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1.5"
                          >
                            {savingPergunta ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Salvar'}
                          </button>
                          <button
                            onClick={() => { setNovaPerguntaFormId(null); setNovaPerguntaTexto(''); }}
                            disabled={savingPergunta}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setNovaPerguntaFormId(form.id); setNovaPerguntaTexto(''); setEditingPergunta(null); }}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors py-1 mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Adicionar pergunta
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={fecharModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFormulario ? 'Editar Formulário' : 'Novo Formulário'}
              </h2>
              <button onClick={fecharModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Virtua Público-Alvo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all"
                  autoFocus
                  disabled={salvando}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o objetivo deste formulário..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all resize-none"
                  disabled={salvando}
                />
              </div>

              {!editingFormulario && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Perguntas</label>
                    <button
                      type="button"
                      onClick={() => setPerguntasModal(prev => [...prev, ''])}
                      disabled={salvando}
                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {perguntasModal.map((texto, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={texto}
                          onChange={e => {
                            const arr = [...perguntasModal];
                            arr[i] = e.target.value;
                            setPerguntasModal(arr);
                          }}
                          placeholder={`Pergunta ${i + 1}...`}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
                          disabled={salvando}
                        />
                        {perguntasModal.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPerguntasModal(prev => prev.filter((_, idx) => idx !== i))}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={salvando}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Deixe em branco para criar sem perguntas e adicioná-las depois.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={salvarFormulario}
                disabled={salvando}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{editingFormulario ? 'Salvando...' : 'Criando...'}</>
                ) : (
                  editingFormulario ? 'Salvar Alterações' : 'Criar Formulário'
                )}
              </button>
              <button
                onClick={fecharModal}
                disabled={salvando}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
