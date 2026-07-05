import React, { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
import { maskCpf, unmaskCpf, isValidCpf } from "../utils/cpf";
import RespostaService from "../services/RespostaService";

export default function CpfModal({ onConfirm, userId }) {
  const [carregando, setCarregando] = useState(true);
  const [cpfsPendentes, setCpfsPendentes] = useState([]);
  const [cpfSelecionado, setCpfSelecionado] = useState("");

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [touched, setTouched] = useState(false);

  const cpfValido = isValidCpf(cpf);
  const pendenteDoCpfDigitado = cpfValido
    ? cpfsPendentes.find((c) => c.valor === unmaskCpf(cpf))
    : null;
  const valido = cpfValido && (nome.trim().length > 0 || Boolean(pendenteDoCpfDigitado));

  useEffect(() => {
    let cancelado = false;

    RespostaService.listarPendentes({ userId })
      .then((lista) => {
        if (cancelado) return;
        const porCpf = new Map();
        (lista || []).forEach((item) => {
          const cpfItem = item.cpf_cliente;
          if (!cpfItem) return;
          const atual = porCpf.get(cpfItem) || { total: 0, nome: null };
          atual.total += 1;
          if (!atual.nome && item.nome_cliente) atual.nome = item.nome_cliente;
          porCpf.set(cpfItem, atual);
        });
        setCpfsPendentes(Array.from(porCpf.entries()).map(([valor, { total, nome }]) => ({ valor, total, nome })));
      })
      .catch(() => {
        if (!cancelado) setCpfsPendentes([]);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [userId]);

  useEffect(() => {
    if (pendenteDoCpfDigitado?.nome && !nome.trim()) {
      setNome(pendenteDoCpfDigitado.nome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendenteDoCpfDigitado]);

  const handleContinuarSelecionado = () => {
    if (!cpfSelecionado) return;
    const info = cpfsPendentes.find((c) => c.valor === cpfSelecionado);
    onConfirm({ cpf: cpfSelecionado, nome: info?.nome || "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valido) return;
    onConfirm({ cpf: unmaskCpf(cpf), nome: nome.trim() || pendenteDoCpfDigitado?.nome || "" });
  };

  const temPendentes = !carregando && cpfsPendentes.length > 0;

  return (
    <div className="p-5 max-w-xl mx-auto w-full">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <User className="w-3.5 h-3.5" />
        Identifique o cliente para continuar
      </div>

      {carregando && (
        <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Verificando atendimentos em andamento...
        </span>
      )}

      {temPendentes && (
        <div className="flex gap-2 mb-3">
          <select
            value={cpfSelecionado}
            onChange={(e) => setCpfSelecionado(e.target.value)}
            className="flex-1 px-2.5 py-1.5 rounded-md border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          >
            <option value="" disabled>
              Continuar atendimento em aberto...
            </option>
            {cpfsPendentes.map(({ valor, total, nome }) => (
              <option key={valor} value={valor}>
                {nome ? `${nome} — ` : ""}
                {maskCpf(valor)} ({total} pendente{total !== 1 ? "s" : ""})
              </option>
            ))}
          </select>

          <button
            onClick={handleContinuarSelecionado}
            disabled={!cpfSelecionado}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors whitespace-nowrap"
          >
            Continuar
          </button>
        </div>
      )}

      {!carregando && (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
          {temPendentes && (
            <p className="w-full text-[11px] text-gray-400">ou cadastre um novo cliente:</p>
          )}

          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Nome do cliente"
            className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-md border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            type="text"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            onBlur={() => setTouched(true)}
            placeholder="000.000.000-00"
            className={`flex-1 min-w-[140px] px-2.5 py-1.5 rounded-md border text-xs focus:outline-none focus:ring-2 transition-colors ${
              touched && !cpfValido
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-200 focus:ring-red-200 focus:border-red-400"
            }`}
          />

          <button
            type="submit"
            disabled={!valido}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors whitespace-nowrap"
          >
            Continuar
          </button>

          {pendenteDoCpfDigitado && (
            <p className="w-full text-amber-600 text-[11px]">
              Esse CPF já tem {pendenteDoCpfDigitado.total} atendimento{pendenteDoCpfDigitado.total !== 1 ? "s" : ""} em aberto — ao continuar, as respostas já dadas serão carregadas.
            </p>
          )}

          {touched && !valido && (
            <p className="w-full text-red-500 text-[11px]">
              {!cpfValido ? "CPF inválido." : "Informe o nome do cliente."}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
