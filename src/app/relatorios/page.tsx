"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { getEstatisticas } from "@/lib/db";
import LoadingScreen from "@/components/LoadingScreen";

type Estatisticas = {
  totalAlunos: number;
  totalAulas: number;
  taxaPresenca: number;
};

const presencaPorMes = [
  { mes: "Jan", taxa: 72 },
  { mes: "Fev", taxa: 78 },
  { mes: "Mar", taxa: 85 },
  { mes: "Abr", taxa: 80 },
  { mes: "Mai", taxa: 88 },
  { mes: "Jun", taxa: 76 },
];

export default function RelatoriosPage() {
  const router = useRouter();
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportado, setExportado] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthChange((u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
    });

    async function carregar() {
      try {
        const data = await getEstatisticas();
        setEstatisticas(data);
      } catch {
        // Dados mockados caso não haja firestore configurado
        setEstatisticas({
          totalAlunos: 0,
          totalAulas: 0,
          taxaPresenca: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => unsubAuth();
  }, [router]);

  function handleExportar() {
    const linhas = [
      "=== Relatório Academia Saúde Cabuçu ===",
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
      "",
      `Total de Alunos: ${estatisticas?.totalAlunos ?? 0}`,
      `Total de Aulas: ${estatisticas?.totalAulas ?? 0}`,
      `Taxa de Presença: ${estatisticas?.taxaPresenca ?? 0}%`,
      "",
      "--- Presença por Mês ---",
      ...presencaPorMes.map((p) => `${p.mes}: ${p.taxa}%`),
      "",
      "=== Fim do Relatório ===",
    ];

    const blob = new Blob([linhas.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-academia-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportado(true);
    setTimeout(() => setExportado(false), 3000);
  }

  if (loading) return <LoadingScreen />;

  const stats = estatisticas || { totalAlunos: 0, totalAulas: 0, taxaPresenca: 0 };

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Relatórios</h1>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-600">
            {stats.totalAlunos}
          </p>
          <p className="mt-1 text-xs text-stone-500">Alunos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-sky-600">
            {stats.totalAulas}
          </p>
          <p className="mt-1 text-xs text-stone-500">Aulas</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {stats.taxaPresenca}%
          </p>
          <p className="mt-1 text-xs text-stone-500">Presença</p>
        </div>
      </div>

      {/* Gráfico de Barras - Presença por Mês */}
      <div className="card mb-8">
        <h2 className="mb-4 font-semibold text-stone-700">
          Presença por Mês
        </h2>
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {presencaPorMes.map((item) => (
            <div key={item.mes} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
              <span className="text-xs font-medium text-stone-500">
                {item.taxa}%
              </span>
              <div
                className="w-full rounded-t-lg bg-orange-500 transition-all duration-500"
                style={{
                  height: `${item.taxa}%`,
                  minHeight: 4,
                  backgroundColor:
                    item.taxa >= 80
                      ? "#16a34a"
                      : item.taxa >= 70
                      ? "#ea580c"
                      : "#dc2626",
                }}
              />
              <span className="text-xs text-stone-400">{item.mes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botão Exportar */}
      <button
        onClick={handleExportar}
        className="btn-secondary w-full"
      >
        {exportado ? "✓ Dados exportados!" : "📥 Exportar dados"}
      </button>

      {exportado && (
        <p className="mt-2 text-center text-xs text-emerald-600">
          Arquivo baixado com sucesso!
        </p>
      )}
    </div>
  );
}
