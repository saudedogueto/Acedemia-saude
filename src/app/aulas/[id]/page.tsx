"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthChange } from "@/lib/auth";
import { getAula, listarAlunosDaAula } from "@/lib/db";
import type { Aula, Aluno } from "@/lib/db";
import LoadingScreen from "@/components/LoadingScreen";

export default function AulaDetalhesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [aula, setAula] = useState<Aula | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
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
        const aulaId = id as string;
        const [aulaData, alunosData] = await Promise.all([
          getAula(aulaId),
          listarAlunosDaAula(aulaId),
        ]);
        setAula(aulaData);
        setAlunos(alunosData);
      } catch (err) {
        console.error("Erro ao carregar aula:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => unsubAuth();
  }, [id, router]);

  if (loading) return <LoadingScreen />;
  if (!aula) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 pb-24 text-center">
        <p className="text-stone-500">Aula não encontrada.</p>
        <Link href="/aulas" className="mt-4 inline-block text-orange-600 underline">
          Voltar para aulas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-3 flex items-center gap-1 text-sm text-stone-500 hover:text-orange-600 transition-colors"
        >
          ← Voltar
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-800">{aula.nome}</h1>
            <p className="mt-1 text-sm text-stone-500">
              {aula.diaSemana} · {aula.horario}
            </p>
            {aula.faixaEtaria && (
              <span className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-700">
                {aula.faixaEtaria}
              </span>
            )}
          </div>
          <Link
            href={`/presenca?aulaId=${aula.id}`}
            className="btn-primary shrink-0 text-sm py-2 px-4"
          >
            Registrar Presença
          </Link>
        </div>

        {aula.descricao && (
          <p className="mt-4 text-sm text-stone-600">{aula.descricao}</p>
        )}
      </div>

      {/* Alunos */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-stone-700">
          Alunos
        </h2>
        {alunos.length === 0 ? (
          <div className="card text-center text-sm text-stone-500">
            Nenhum aluno vinculado a esta aula ainda.
            <p className="mt-2 text-xs text-stone-400">
              Registre a presença do aluno nesta aula para vinculá-lo.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {alunos.map((aluno) => (
              <Link
                key={aluno.id}
                href={`/alunos/${aluno.id}`}
                className="card-hover flex items-center gap-3 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm">
                  👤
                </div>
                <span className="font-medium text-stone-700">{aluno.nome}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
