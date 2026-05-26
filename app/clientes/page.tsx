"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ClientModal } from "@/components/ClientModal";
import { createWhatsAppClientLink } from "@/lib/appointments";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { Client } from "@/types";

export default function ClientesPage() {
  const { clients, syncFromDatabase } = useBarberFlowStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState("");

  function openCreateModal() {
    setSelectedClient(null);
    setModalOpen(true);
  }

  function openEditModal(client: Client) {
    setSelectedClient(client);
    setModalOpen(true);
  }

  async function handleRemove(id: string) {
    const response = await fetch(`/api/clients/${id}`, {
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
      title="Clientes"
      description="Cadastre, edite, remova e acione clientes rapidamente pelo WhatsApp."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-black">Clientes cadastrados</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Total: {clients.length} clientes
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-black text-black shadow-lg shadow-[#d4af37]/20"
          >
            Novo cliente
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm font-bold text-[#d4af37]">
            {message}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <article
              key={client.id}
              className="rounded-[2rem] border border-white/10 bg-black/25 p-5"
            >
              <h3 className="text-xl font-black">{client.name}</h3>

              <a
                href={createWhatsAppClientLink(client.phone)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-sm font-bold text-[#d4af37]"
              >
                Abrir WhatsApp
              </a>

              <p className="mt-2 text-xs text-zinc-500">{client.phone}</p>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                {client.notes ?? "Sem observações cadastradas."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => openEditModal(client)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleRemove(client.id)}
                  className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ClientModal
        open={modalOpen}
        client={selectedClient}
        onClose={() => {
          setModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </AppShell>
  );
}
