"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ServiceModal } from "@/components/ServiceModal";
import { formatCurrency } from "@/lib/format";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { Service } from "@/types";

export default function ServicosPage() {
  const { services, removeService } = useBarberFlowStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [message, setMessage] = useState("");

  function openCreateModal() {
    setSelectedService(null);
    setModalOpen(true);
  }

  function openEditModal(service: Service) {
    setSelectedService(service);
    setModalOpen(true);
  }

  function handleRemove(id: string) {
    const result = removeService(id);
    setMessage(result.message);
  }

  return (
    <AppShell
      title="Serviços"
      description="Cadastre, edite, desative ou remova serviços usados nos agendamentos e no financeiro."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-black">Serviços cadastrados</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Total: {services.length} serviços
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-black text-black shadow-lg shadow-[#d4af37]/20"
          >
            Novo serviço
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm font-bold text-[#d4af37]">
            {message}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.id}
              className="rounded-[2rem] border border-white/10 bg-black/25 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-black">{service.name}</h3>

                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-zinc-300">
                  {service.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <p className="mt-4 text-3xl font-black text-[#d4af37]">
                {formatCurrency(service.price)}
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                {service.durationMinutes} minutos
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => openEditModal(service)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleRemove(service.id)}
                  className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ServiceModal
        open={modalOpen}
        service={selectedService}
        onClose={() => {
          setModalOpen(false);
          setSelectedService(null);
        }}
      />
    </AppShell>
  );
}
