import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppContent } from "@/components/AppContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Academia Saúde Cabuçu",
  description:
    "Transformando vidas através do esporte — Gestão de alunos, aulas e presenças.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Loading screen que aparece instantaneamente antes do React */}
        <style>{`
          .loading-init {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(to bottom right, #FFF5EE, #FFEDD5, #FFE4C4);
            transition: opacity 0.3s ease-out;
          }
          .loading-init.hide {
            opacity: 0;
            pointer-events: none;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #fed7aa;
            border-top-color: #ea580c;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #9a3412;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .loading-sub {
            margin-top: 4px;
            font-size: 0.8rem;
            color: #c2410c;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </head>
      <body className={`${inter.className} min-h-screen bg-[#FFF5EE] text-stone-900`}>
        {/* Loading screen inicial - será removido pelo React */}
        <div id="loading-init" className="loading-init">
          <div className="loading-spinner" />
          <div className="loading-title">🏋️ Academia Saúde Cabuçu</div>
          <div className="loading-sub">Carregando...</div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // Remove loading screen quando React hidratar ou após 4s
            window.addEventListener('load', () => {
              setTimeout(() => {
                const el = document.getElementById('loading-init');
                if (el) {
                  el.classList.add('hide');
                  setTimeout(() => el.remove(), 300);
                }
              }, 500);
            });
          `,
        }} />

        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
