"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthChange } from "@/lib/auth";
import { listarAlunos } from "@/lib/db";
import type { Aluno } from "@/lib/db";
import LoadingScreen from "@/components/LoadingScreen";

export default function AlunosPage() {
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [busca, setBusca] = useState("");
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
        const data = await listarAlunos();
        setAlunos(data);
      } catch (err) {
        console.error("Erro ao carregar alunos:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();

    return () => unsubAuth();
  }, [router]);

  const filtrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Alunos</h1>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-5"
      />

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="text-5xl">👤</span>
          <p className="mt-4 text-lg font-medium text-stone-600">
            Nenhum aluno cadastrado ainda
          </p>
          <p className="mt-1 text-sm text-stone-400">
            Clique no botão + para adicionar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((aluno) => (
            <Link
              key={aluno.id}
              href={`/alunos/${aluno.id}`}
              className="card-hover flex items-center gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate">
                  {aluno.nome}
                </p>
                <p className="text-sm text-stone-500 truncate">
                  {aluno.telefone && `${aluno.telefone}`}
                  {aluno.telefone && aluno.bairro && " · "}
                  {aluno.bairro && `${aluno.bairro}`}
                </p>
              </div>
              <span className="text-stone-300">›</span>
            </Link>
          ))}
        </div>
      )}

      {/* FAB */}
      <Link href="/alunos/novo" className="fab">
        +
      </Link>
    </div>
  );
}
