"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { criarAula } from "@/lib/db";

const diasSemana = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const faixasEtarias = [
  "Infantil (6-12)",
  "Adolescentes (13-17)",
  "Adulto (18-40)",
  "Sênior (40+)",
  "Livre",
];

export default function NovaAulaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nome: "",
    diaSemana: "Segunda",
    horario: "",
    faixaEtaria: "Livre",
    descricao: "",
  });

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (!u) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  function atualizar(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) {
      setErro("O nome da aula é obrigatório.");
      return;
    }
    if (!form.horario) {
      setErro("O horário é obrigatório.");
      return;
    }

    setCarregando(true);
    try {
      await criarAula(form);
      router.push("/aulas");
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-orange-600 transition-colors"
      >
        ← Voltar
      </button>

      <h1 className="mb-6 text-2xl font-bold text-stone-800">Nova Aula</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Nome da Aula <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Funcional Matinal"
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Dia da Semana <span className="text-red-500">*</span>
          </label>
          <select
            value={form.diaSemana}
            onChange={(e) => atualizar("diaSemana", e.target.value)}
          >
            {diasSemana.map((dia) => (
              <option key={dia} value={dia}>
                {dia}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Horário <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={form.horario}
            onChange={(e) => atualizar("horario", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Faixa Etária
          </label>
          <select
            value={form.faixaEtaria}
            onChange={(e) => atualizar("faixaEtaria", e.target.value)}
          >
            {faixasEtarias.map((faixa) => (
              <option key={faixa} value={faixa}>
                {faixa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Descrição
          </label>
          <textarea
            rows={3}
            placeholder="Descrição da aula..."
            value={form.descricao}
            onChange={(e) => atualizar("descricao", e.target.value)}
          />
        </div>

        {erro && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="btn-primary w-full"
        >
          {carregando ? "Salvando..." : "Salvar Aula"}
        </button>
      </form>
    </div>
  );
}
