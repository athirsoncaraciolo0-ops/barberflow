"use client";

import { useEffect, useState } from "react";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { Client } from "@/types";

type ClientModalProps = {
  open: boolean;
  client?: Client | null;
  onClose: () => void;
};

export function ClientModal({ open, client, onClose }: ClientModalProps) {
  const syncFromDatabase = useBarberFlowStore((state) => state.syncFromDatabase);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(client);

  useEffect(() => {
    if (!open) return;

    setMessage("");
    setName(client?.name ?? "");
    setPhone(client?.phone ?? "");
    setNotes(client?.notes ?? "");
  }, [client, open]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setMessage("Nome e telefone são obrigatórios.");
      return;
    }

    setSaving(true);
    setMessage("");

    const response = await fetch(
      client ? `/api/clients/${client.id}` : "/api/clients",
      {
        method: client ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          notes,
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      setMessage(result.message);
      setSaving(false);
      return;
    }

    await syncFromDatabase();
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:items-center">
      <div className="w-full max-w-xl rounded-[2rem] border border-[var(--bf-primary)]/25 bg-[#101010] p-5 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--bf-primary)]">
              {isEditing ? "Editar cliente" : "Novo cliente"}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {isEditing ? "Alterar cadastro" : "Cadastrar cliente"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-zinc-300"
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">Nome</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--bf-primary)]/60"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">WhatsApp</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="5581999999999"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--bf-primary)]/60"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">Observações</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--bf-primary)]/60"
            />
          </label>

          {message && (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {message}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 font-black text-white"
            >
              Cancelar
            </button>

            <button
              disabled={saving}
              className="rounded-2xl bg-[var(--bf-primary)] px-5 py-4 font-black text-black shadow-lg disabled:opacity-50"
            >
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Salvar alteração"
                  : "Salvar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
