"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      setMessage(result.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070707] px-4 text-[#f8f5ed]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#d4af37]/25 bg-white/[0.05] p-6 shadow-2xl shadow-black/50">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#d4af37] text-2xl font-black text-black">
            BF
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37]">
            BarberFlow
          </p>

          <h1 className="mt-3 text-3xl font-black">Acesso administrativo</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Entre para acessar o sistema da barbearia.
          </p>
        </div>

        <form onSubmit={handleLogin} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">Usuário</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
            />
          </label>

          {message && (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {message}
            </p>
          )}

          <button
            disabled={loading}
            className="rounded-2xl bg-[#d4af37] px-5 py-4 font-black text-black shadow-lg disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
