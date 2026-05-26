"use client";

import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/types";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";

type AppointmentModalProps = {
  open: boolean;
  appointment?: Appointment | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const defaultDate = "2026-05-26";

export function AppointmentModal({
  open,
  appointment,
  onClose,
  onSuccess,
}: AppointmentModalProps) {
  const {
    clients,
    services,
    barbers,
    addAppointment,
    updateAppointment,
  } = useBarberFlowStore();

  const firstClient = clients[0]?.id ?? "";
  const firstService = services[0]?.id ?? "";
  const firstBarber = barbers[0]?.id ?? "";

  const [clientId, setClientId] = useState(firstClient);
  const [serviceId, setServiceId] = useState(firstService);
  const [barberId, setBarberId] = useState(firstBarber);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [message, setMessage] = useState("");

  const isEditing = Boolean(appointment);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [services, serviceId]
  );

  useEffect(() => {
    if (!open) return;

    setMessage("");

    if (appointment) {
      setClientId(appointment.clientId);
      setServiceId(appointment.serviceId);
      setBarberId(appointment.barberId);
      setDate(appointment.date);
      setTime(appointment.time);
      return;
    }

    setClientId(firstClient);
    setServiceId(firstService);
    setBarberId(firstBarber);
    setDate(defaultDate);
    setTime("09:00");
  }, [appointment, firstBarber, firstClient, firstService, open]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientId || !serviceId || !barberId || !date || !time) {
      setMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      clientId,
      serviceId,
      barberId,
      date,
      time,
    };

    const result = appointment
      ? updateAppointment(appointment.id, payload)
      : addAppointment(payload);

    setMessage(result.message);

    if (result.success) {
      onClose();
      onSuccess?.();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:items-center">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#d4af37]/25 bg-[#101010] p-5 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37]">
              {isEditing ? "Editar horário" : "Novo horário"}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {isEditing ? "Alterar agendamento" : "Criar agendamento"}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Ajuste cliente, serviço, barbeiro, data e horário.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-zinc-300"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Cliente">
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Serviço">
              <select
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} • R$ {service.price}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Barbeiro">
              <select
                value={barberId}
                onChange={(event) => setBarberId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
              >
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Data">
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
              />
            </Field>

            <Field label="Horário">
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#d4af37]/60"
              />
            </Field>

            <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 p-4">
              <p className="text-sm text-zinc-400">Duração estimada</p>
              <strong className="mt-1 block text-xl text-[#d4af37]">
                {selectedService?.durationMinutes ?? 0} min
              </strong>
            </div>
          </div>

          {message && (
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
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
              {isEditing ? "Salvar alteração" : "Criar agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
