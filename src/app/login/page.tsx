"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin, registerAdmin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isCadastro, setIsCadastro] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      if (isCadastro) {
        if (senha !== confirmarSenha) {
          setErro("As senhas não conferem.");
          setCarregando(false);
          return;
        }
        await registerAdmin(email, senha);
      } else {
        await loginAdmin(email, senha);
      }
      router.push("/dashboard");
    } catch (err: any) {
      const mensagens: Record<string, string> = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "Email ou senha inválidos.",
        "auth/email-already-in-use": "Este email já está cadastrado.",
        "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
        "auth/invalid-email": "Email inválido.",
      };
      setErro(
        mensagens[err.code] || "Ocorreu um erro. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  function alternarModo() {
    setIsCadastro(!isCadastro);
    setErro("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 bg-gradient-to-b from-orange-50 via-white to-orange-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-3xl shadow-lg">
            🏋️
          </div>
          <h1 className="text-2xl font-bold text-orange-800">
            Academia Saúde Cabuçu
          </h1>
          <p className="mt-1 text-sm text-orange-600">
            Transformando vidas através do esporte
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="bg-white"
            />
          </div>

          {isCadastro && (
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Confirmar Senha
              </label>
              <input
                type="password"
                placeholder="Confirme a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                className="bg-white"
              />
            </div>
          )}

          {erro && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="btn-primary w-full text-base"
          >
            {carregando
              ? "Aguarde..."
              : isCadastro
              ? "Cadastrar"
              : "Entrar"}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-stone-500">
          {isCadastro ? "Já tem uma conta?" : "Não tem conta?"}{" "}
          <button
            onClick={alternarModo}
            className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2"
          >
            {isCadastro ? "Faça login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}
