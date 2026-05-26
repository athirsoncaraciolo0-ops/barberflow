"use client";

import { useEffect, useState } from "react";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { Service } from "@/types";

type ServiceModalProps = {
  open: boolean;
  service?: Service | null;
  onClose: () => void;
};

export function ServiceModal({ open, service, onClose }: ServiceModalProps) {
  const syncFromDatabase = useBarberFlowStore((state) => state.syncFromDatabase);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [active, setActive] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(service);

  useEffect(() => {
    if (!open) return;

    setMessage("");
    setName(service?.name ?? "");
    setPrice(String(service?.price ?? ""));
    setDurationMinutes(String(service?.durationMinutes ?? 30));
    setActive(service?.active ?? true);
  }, [open, service]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const response = await fetch(
      service ? `/api/services/${service.id}` : "/api/services",
      {
        method: service ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          durationMinutes: Number(durationMinutes),
          active,
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
              {isEditing ? "Editar serviço" : "Novo serviço"}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {isEditing ? "Alterar serviço" : "Cadastrar serviço"}
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
              placeholder="Ex: Corte degradê"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--bf-primary)]/60"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">Preço</span>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--bf-primary)]/60"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">Duração em minutos</span>
              <input
                type="number"
                min="1"
                step="5"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--bf-primary)]/60"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-5"
            />
            <span className="text-sm font-bold text-zinc-300">Serviço ativo</span>
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
                  : "Salvar serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
