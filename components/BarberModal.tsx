"use client";

import { useEffect, useState } from "react";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { Barber } from "@/types";

type BarberModalProps = {
  open: boolean;
  barber?: Barber | null;
  onClose: () => void;
};

export function BarberModal({ open, barber, onClose }: BarberModalProps) {
  const { addBarber, updateBarber } = useBarberFlowStore();

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [active, setActive] = useState(true);
  const [message, setMessage] = useState("");

  const isEditing = Boolean(barber);

  useEffect(() => {
    if (!open) return;

    setMessage("");
    setName(barber?.name ?? "");
    setSpecialty(barber?.specialty ?? "");
    setActive(barber?.active ?? true);
  }, [open, barber]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: name.trim(),
      specialty: specialty.trim(),
      active,
    };

    const result = barber
      ? updateBarber(barber.id, payload)
      : addBarber(payload);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:items-center">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#d4af37]/25 bg-[#101010] p-5 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37]">
              {isEditing ? "Editar barbeiro" : "Novo barbeiro"}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {isEditing ? "Alterar barbeiro" : "Cadastrar barbeiro"}
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
              placeholder="Ex: Rafael"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">Especialidade</span>
            <input
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              placeholder="Ex: Especialista em degradê"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-5"
            />
            <span className="text-sm font-bold text-zinc-300">Barbeiro ativo</span>
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

            <button className="rounded-2xl bg-[#d4af37] px-5 py-4 font-black text-black shadow-lg shadow-[#d4af37]/20">
              {isEditing ? "Salvar alteração" : "Salvar barbeiro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
