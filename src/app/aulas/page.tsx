"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthChange } from "@/lib/auth";
import { listarAulas } from "@/lib/db";
import type { Aula } from "@/lib/db";
import LoadingScreen from "@/components/LoadingScreen";

const diasSemana = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

const cores = [
  "bg-orange-100 border-orange-200",
  "bg-sky-100 border-sky-200",
  "bg-emerald-100 border-emerald-200",
  "bg-violet-100 border-violet-200",
  "bg-rose-100 border-rose-200",
  "bg-amber-100 border-amber-200",
];

export default function AulasPage() {
  const router = useRouter();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [filtroDia, setFiltroDia] = useState<string>("");
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
        const data = await listarAulas();
        setAulas(data);
      } catch (err) {
        console.error("Erro ao carregar aulas:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();

    return () => unsubAuth();
  }, [router]);

  const filtradas = filtroDia
    ? aulas.filter((a) => a.diasSemana?.includes(filtroDia))
    : aulas;

  if (loading) return <LoadingScreen />;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Aulas</h1>

      {/* Filtros */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFiltroDia("")}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
            !filtroDia
              ? "bg-orange-600 text-white"
              : "bg-white text-stone-500 border border-gray-200"
          }`}
        >
          Todas
        </button>
        {diasSemana.map((dia) => (
          <button
            key={dia}
            onClick={() => setFiltroDia(dia)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              filtroDia === dia
                ? "bg-orange-600 text-white"
                : "bg-white text-stone-500 border border-gray-200"
            }`}
          >
            {dia}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="text-5xl">📅</span>
          <p className="mt-4 text-lg font-medium text-stone-600">
            Nenhuma aula cadastrada
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((aula, i) => (
            <Link
              key={aula.id}
              href={`/aulas/${aula.id}`}
              className={`${cores[i % cores.length]} border rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate">
                  {aula.nome}
                </p>
                <p className="text-sm text-stone-500">
                  {aula.diasSemana?.join(', ') || 'Sem dias'} · {aula.horario}
                </p>
                <p className="text-xs text-stone-400">{aula.faixaEtaria}</p>
              </div>
              <span className="text-stone-400">›</span>
            </Link>
          ))}
        </div>
      )}

      {/* FAB */}
      <Link href="/aulas/nova" className="fab">
        +
      </Link>
    </div>
  );
}
