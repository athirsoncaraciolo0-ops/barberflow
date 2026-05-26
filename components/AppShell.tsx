"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";

const menuItems = [
  { href: "/", label: "Dashboard" },
  { href: "/agenda", label: "Agenda" },
  { href: "/clientes", label: "Clientes" },
  { href: "/servicos", label: "Serviços" },
  { href: "/barbeiros", label: "Barbeiros" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/configuracoes", label: "Configurações" },
];

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const businessSettings = useBarberFlowStore((state) => state.businessSettings);

  const theme = useMemo(
    () => ({
      primary: businessSettings?.theme?.primary || "#d4af37",
      background: businessSettings?.theme?.background || "#070707",
      foreground: businessSettings?.theme?.foreground || "#f8f5ed",
    }),
    [businessSettings]
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--bf-primary", theme.primary);
    document.documentElement.style.setProperty("--bf-background", theme.background);
    document.documentElement.style.setProperty("--bf-foreground", theme.foreground);
    document.body.style.background = theme.background;
    document.body.style.color = theme.foreground;
  }, [theme]);

  return (
    <main
      style={{
        "--bf-primary": theme.primary,
        "--bf-background": theme.background,
        "--bf-foreground": theme.foreground,
        backgroundColor: theme.background,
        color: theme.foreground,
      } as React.CSSProperties}
      className="min-h-screen overflow-hidden"
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle at top left, ${theme.primary}33, transparent 32rem), radial-gradient(circle at bottom right, ${theme.primary}1f, transparent 30rem)`,
        }}
      />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-[var(--bf-primary)]/20 bg-white/[0.05] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--bf-primary)] text-2xl font-black text-black shadow-lg">
                {businessSettings?.initials || "BF"}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--bf-primary)]">
                  {businessSettings?.productName || "BarberFlow"}
                </p>
                <h1 className="mt-1 text-2xl font-black md:text-3xl">
                  {businessSettings?.businessName || "Barbearia Imperial"}
                </h1>
                <p className="text-sm text-zinc-400">
                  {businessSettings?.slogan || "Precisão, estilo e tradição."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setAppointmentModalOpen(true)}
              className="rounded-2xl bg-[var(--bf-primary)] px-4 py-3 text-sm font-black text-black shadow-lg"
            >
              Novo agendamento
            </button>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-zinc-300 transition hover:border-[var(--bf-primary)] hover:text-[var(--bf-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="mt-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--bf-primary)]">
              BarberFlow
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              {description}
            </p>
          </div>

          {children}
        </section>
      </section>

      <AppointmentModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        onSuccess={() => router.push("/agenda")}
      />
    </main>
  );
}
