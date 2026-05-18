"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/alunos", label: "Alunos", icon: "👥" },
  { href: "/aulas", label: "Aulas", icon: "📅" },
  { href: "/relatorios", label: "Relatórios", icon: "📊" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-orange-600 scale-105"
                    : "text-gray-500 hover:text-orange-500"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-orange-600" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 w-8 h-0.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
