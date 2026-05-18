"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthChange, logout } from "@/lib/auth";
import { getEstatisticas } from "@/lib/db";
import LoadingScreen from "@/components/LoadingScreen";

const cards = [
  { href: "/alunos", icon: "👥", label: "Alunos", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { href: "/aulas", icon: "📅", label: "Aulas", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { href: "/presenca", icon: "✅", label: "Presença", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { href: "/relatorios", icon: "📊", label: "Relatórios", color: "bg-violet-100 text-violet-700 border-violet-200" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalAlunos: 0, totalAulas: 0, taxaPresenca: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      setUser(u);
      try {
        const data = await getEstatisticas();
        setStats({
          totalAlunos: data.totalAlunos,
          totalAulas: data.totalAulas,
          taxaPresenca: data.taxaPresenca,
        });
      } catch {
        // ignora
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading) return <LoadingScreen />;

  const nome = user?.email?.split("@")[0] || "Admin";

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Olá, {nome} 👋
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Bem-vindo de volta!
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
        >
          Sair
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${card.color} border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <span className="text-4xl">{card.icon}</span>
            <span className="font-semibold text-sm text-center leading-tight">
              {card.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-stone-700">
          Estatísticas Rápidas
        </h2>
        <div className="grid grid-cols-3 gap-3">
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
      </div>
    </div>
  );
}
