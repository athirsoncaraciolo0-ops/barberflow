"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BarberModal } from "@/components/BarberModal";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { Barber } from "@/types";

export default function BarbeirosPage() {
  const { barbers, syncFromDatabase } = useBarberFlowStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [message, setMessage] = useState("");

  function openCreateModal() {
    setSelectedBarber(null);
    setModalOpen(true);
  }

  function openEditModal(barber: Barber) {
    setSelectedBarber(barber);
    setModalOpen(true);
  }

  async function handleRemove(id: string) {
    const response = await fetch(`/api/barbers/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    setMessage(result.message);

    if (result.success) {
      await syncFromDatabase();
    }
  }

  return (
    <AppShell
      title="Barbeiros"
      description="Cadastre, edite, desative ou remova barbeiros usados na agenda e nos filtros do dashboard."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-black">Equipe cadastrada</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Total: {barbers.length} barbeiros
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-black text-black shadow-lg shadow-[#d4af37]/20"
          >
            Novo barbeiro
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm font-bold text-[#d4af37]">
            {message}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {barbers.map((barber) => (
            <article
              key={barber.id}
              className="rounded-[2rem] border border-white/10 bg-black/25 p-5"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#d4af37] text-xl font-black text-black">
                {barber.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">{barber.name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{barber.specialty}</p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-zinc-300">
                  {barber.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => openEditModal(barber)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleRemove(barber.id)}
                  className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BarberModal
        open={modalOpen}
        barber={selectedBarber}
        onClose={() => {
          setModalOpen(false);
          setSelectedBarber(null);
        }}
      />
    </AppShell>
  );
}
