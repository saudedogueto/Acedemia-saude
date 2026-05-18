"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthChange } from "@/lib/auth";
import { getAluno, listarMedidas, listarPresencasPorAluno } from "@/lib/db";
import type { Aluno, MedidaCorporal, Presenca } from "@/lib/db";
import LoadingScreen from "@/components/LoadingScreen";

type Aba = "dados" | "medidas" | "presenca";

export default function AlunoDetalhesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [aba, setAba] = useState<Aba>("dados");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthChange((u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
    });

    async function carregar() {
      try {
        const alunoId = id as string;
        const [alunoData, medidasData, presencasData] = await Promise.all([
          getAluno(alunoId),
          listarMedidas(alunoId),
          listarPresencasPorAluno(alunoId),
        ]);
        setAluno(alunoData);
        setMedidas(medidasData);
        setPresencas(presencasData);
      } catch (err) {
        console.error("Erro ao carregar aluno:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => unsubAuth();
  }, [id, router]);

  if (loading) return <LoadingScreen />;
  if (!aluno) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 pb-24 text-center">
        <p className="text-stone-500">Aluno não encontrado.</p>
        <Link href="/alunos" className="mt-4 inline-block text-orange-600 underline">
          Voltar para alunos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-lg hover:bg-orange-100 transition-colors"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-stone-800 truncate">
            {aluno.nome}
          </h1>
        </div>
      </div>

      {/* Abas */}
      <div className="mb-6 flex gap-2">
        {(["dados", "medidas", "presenca"] as Aba[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
              aba === tab
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-stone-500 border border-gray-200 hover:bg-orange-50"
            }`}
          >
            {tab === "dados" && "📋 Dados"}
            {tab === "medidas" && "📏 Medidas"}
            {tab === "presenca" && "✅ Presença"}
          </button>
        ))}
      </div>

      {/* Aba Dados */}
      {aba === "dados" && (
        <div className="card space-y-4">
          {aluno.telefone && (
            <div>
              <p className="text-xs text-stone-400">Telefone</p>
              <p className="font-medium">{aluno.telefone}</p>
            </div>
          )}
          {aluno.dataNascimento && (
            <div>
              <p className="text-xs text-stone-400">Data de Nascimento</p>
              <p className="font-medium">
                {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
          {aluno.endereco && (
            <div>
              <p className="text-xs text-stone-400">Endereço</p>
              <p className="font-medium">{aluno.endereco}</p>
            </div>
          )}
          {aluno.bairro && (
            <div>
              <p className="text-xs text-stone-400">Bairro</p>
              <p className="font-medium">{aluno.bairro}</p>
            </div>
          )}
          {aluno.contatoEmergencia && (
            <div>
              <p className="text-xs text-stone-400">Contato de Emergência</p>
              <p className="font-medium">{aluno.contatoEmergencia}</p>
            </div>
          )}
          {aluno.observacoes && (
            <div>
              <p className="text-xs text-stone-400">Observações</p>
              <p className="text-sm text-stone-600">{aluno.observacoes}</p>
            </div>
          )}
        </div>
      )}

      {/* Aba Medidas */}
      {aba === "medidas" && (
        <div>
          {medidas.length === 0 ? (
            <div className="card text-center text-stone-500">
              Nenhuma medida registrada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {medidas.map((m) => (
                <div key={m.id} className="card">
                  <p className="mb-2 text-sm font-semibold text-orange-700">
                    {new Date(m.data).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {m.peso && <p><span className="text-stone-400">Peso:</span> {m.peso} kg</p>}
                    {m.altura && <p><span className="text-stone-400">Altura:</span> {m.altura} cm</p>}
                    {m.cintura && <p><span className="text-stone-400">Cintura:</span> {m.cintura} cm</p>}
                    {m.quadril && <p><span className="text-stone-400">Quadril:</span> {m.quadril} cm</p>}
                  </div>
                  {m.observacoes && (
                    <p className="mt-2 text-xs text-stone-500">{m.observacoes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aba Presença */}
      {aba === "presenca" && (
        <div>
          {presencas.length === 0 ? (
            <div className="card text-center text-stone-500">
              Nenhuma presença registrada ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {presencas.map((p) => (
                <div key={p.id} className="card flex items-center gap-3 py-3">
                  <span className="text-lg">{p.presente ? "✅" : "❌"}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(p.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
