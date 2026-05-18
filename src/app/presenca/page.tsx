"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { listarAulas, listarAlunos, salvarPresencas } from "@/lib/db";
import type { Aula, Aluno } from "@/lib/db";
import LoadingScreen from "@/components/LoadingScreen";

function PresencaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aulaIdParam = searchParams.get("aulaId");

  const [aulas, setAulas] = useState<Aula[]>([]);
  const [aulaId, setAulaId] = useState(aulaIdParam || "");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthChange((u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
    });

    async function carregar() {
      try {
        const dataAulas = await listarAulas();
        setAulas(dataAulas);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();

    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (aulaIdParam && aulas.length > 0) {
      setAulaId(aulaIdParam);
    }
  }, [aulaIdParam, aulas]);

  useEffect(() => {
    if (!aulaId) {
      setAlunos([]);
      return;
    }

    async function carregarAlunos() {
      try {
        const data = await listarAlunos();
        const comId: (Aluno & { id: string })[] = data.filter((a: any) => !!a.id);
        setAlunos(comId);
        const inicial: Record<string, boolean> = {};
        comId.forEach((a) => { inicial[a.id] = true; });
        setPresencas(inicial);
      } catch (err) {
        console.error(err);
      }
    }
    carregarAlunos();
  }, [aulaId]);

  function togglePresenca(alunoId: string) {
    setPresencas((prev) => ({ ...prev, [alunoId]: !prev[alunoId] }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setSucesso("");
    try {
      const registros = Object.entries(presencas).map(([alunoId, presente]) => ({
        alunoId, aulaId, data, presente,
      }));
      await salvarPresencas(registros);
      setSucesso("Presenças salvas com sucesso! ✅");
      setTimeout(() => setSucesso(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-orange-600 transition-colors"
      >
        ← Voltar
      </button>

      <h1 className="mb-6 text-2xl font-bold text-stone-800">Registrar Presença</h1>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-stone-700">Aula</label>
        <select value={aulaId} onChange={(e) => setAulaId(e.target.value)}>
          <option value="">Selecione uma aula...</option>
          {aulas.filter((a) => !!a.id).map((a) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-stone-700">Data</label>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      </div>

      {aulaId && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-700">Alunos</p>
            <p className="text-xs text-stone-400">{Object.values(presencas).filter(Boolean).length} presentes</p>
          </div>

          {alunos.length === 0 ? (
            <div className="card text-center text-sm text-stone-500">Nenhum aluno cadastrado.</div>
          ) : (
            <div className="space-y-2">
              {alunos.map((aluno) => (
                <button
                  key={aluno.id}
                  onClick={() => aluno.id && togglePresenca(aluno.id)}
                  className={`card-hover flex w-full items-center gap-3 py-3 text-left ${
                    aluno.id && presencas[aluno.id] ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    aluno.id && presencas[aluno.id] ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-400"
                  }`}>
                    {aluno.id && presencas[aluno.id] ? "✓" : "✗"}
                  </div>
                  <span className={`font-medium ${aluno.id && presencas[aluno.id] ? "text-emerald-800" : "text-stone-500"}`}>
                    {aluno.nome}
                  </span>
                </button>
              ))}
            </div>
          )}

          {alunos.length > 0 && (
            <div className="mt-6">
              {sucesso && (
                <div className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
                  {sucesso}
                </div>
              )}
              <button onClick={handleSalvar} disabled={salvando} className="btn-primary w-full">
                {salvando ? "Salvando..." : "Salvar Presenças"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PresencaPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PresencaForm />
    </Suspense>
  );
}
