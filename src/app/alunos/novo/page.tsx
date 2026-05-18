"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { criarAluno } from "@/lib/db";

export default function NovoAlunoPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    nome: "",
    dataNascimento: "",
    telefone: "",
    endereco: "",
    bairro: "",
    contatoEmergencia: "",
    observacoes: "",
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
      setErro("O nome do aluno é obrigatório.");
      return;
    }

    setCarregando(true);
    try {
      await criarAluno(form);
      router.push("/alunos");
    } catch (err: any) {
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

      <h1 className="mb-6 text-2xl font-bold text-stone-800">
        Novo Aluno
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nome completo"
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Data de Nascimento
          </label>
          <input
            type="date"
            value={form.dataNascimento}
            onChange={(e) => atualizar("dataNascimento", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Telefone
          </label>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={form.telefone}
            onChange={(e) => atualizar("telefone", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Endereço
          </label>
          <input
            type="text"
            placeholder="Rua, número"
            value={form.endereco}
            onChange={(e) => atualizar("endereco", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Bairro
          </label>
          <input
            type="text"
            placeholder="Bairro"
            value={form.bairro}
            onChange={(e) => atualizar("bairro", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Contato de Emergência
          </label>
          <input
            type="text"
            placeholder="Nome e telefone"
            value={form.contatoEmergencia}
            onChange={(e) => atualizar("contatoEmergencia", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Observações
          </label>
          <textarea
            rows={3}
            placeholder="Informações relevantes..."
            value={form.observacoes}
            onChange={(e) => atualizar("observacoes", e.target.value)}
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
          {carregando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
