"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppointmentModal } from "@/components/AppointmentModal";
import {
  createWhatsAppReminderLink,
  sortAppointmentsByPriority,
} from "@/lib/appointments";
import { formatCurrency } from "@/lib/format";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { Appointment } from "@/types";

const ITEMS_PER_PAGE = 5;

const statusLabel = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function AgendaPage() {
  const {
    appointments,
    clients,
    services,
    barbers,
    completeAppointment,
    cancelAppointment,
    restoreAppointment,
  } = useBarberFlowStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);

  const enrichedAppointments = useMemo(() => {
    return sortAppointmentsByPriority(
      appointments.map((appointment) => {
        const client = clients.find((item) => item.id === appointment.clientId);
        const service = services.find((item) => item.id === appointment.serviceId);
        const barber = barbers.find((item) => item.id === appointment.barberId);

        return {
          ...appointment,
          clientName: client?.name ?? "Cliente não encontrado",
          clientPhone: client?.phone ?? "",
          serviceName: service?.name ?? "Serviço não encontrado",
          servicePrice: service?.price ?? 0,
          barberName: barber?.name ?? "Barbeiro não encontrado",
        };
      })
    );
  }, [appointments, barbers, clients, services]);

  const totalPages = Math.max(
    1,
    Math.ceil(enrichedAppointments.length / ITEMS_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleAppointments = enrichedAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function openCreateModal() {
    setSelectedAppointment(null);
    setModalOpen(true);
  }

  function openEditModal(appointment: Appointment) {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedAppointment(null);
  }

  function handleComplete(id: string) {
    const result = completeAppointment(id);
    setMessage(result.message);
  }

  function handleCancel(id: string) {
    const result = cancelAppointment(id);
    setMessage(result.message);
  }

  function handleRestore(id: string) {
    const result = restoreAppointment(id);
    setMessage(result.message);
  }

  return (
    <AppShell
      title="Agenda"
      description="Controle horários, edite agendamentos, conclua, cancele e restaure com proteção contra conflitos."
    >
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-black">Atendimentos</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Ativos aparecem primeiro. Concluídos e cancelados ficam no final.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-black text-black shadow-lg shadow-[#d4af37]/20"
          >
            Novo agendamento
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm font-bold text-[#d4af37]">
            {message}
          </p>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">
            Página {currentPage} de {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {visibleAppointments.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-3xl border border-white/10 bg-black/25 p-4 xl:grid-cols-[120px_1fr_140px_120px_410px] xl:items-center"
            >
              <div>
                <strong className="block text-xl text-[#d4af37]">{item.time}</strong>
                <span className="text-xs text-zinc-500">{item.date}</span>
              </div>

              <div>
                <h3 className="font-black">{item.clientName}</h3>
                <p className="text-sm text-zinc-400">{item.serviceName}</p>
              </div>

              <p className="text-sm text-zinc-300">{item.barberName}</p>

              <p className="font-bold text-[#d4af37]">
                {formatCurrency(item.servicePrice)}
              </p>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-zinc-300">
                  {statusLabel[item.status]}
                </span>

                {item.clientPhone && (
                  <a
                    href={createWhatsAppReminderLink(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-black text-black"
                  >
                    WhatsApp
                  </a>
                )}

                <button
                  onClick={() => openEditModal(item)}
                  disabled={item.status === "completed"}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Editar
                </button>

                {item.status === "cancelled" ? (
                  <button
                    onClick={() => handleRestore(item.id)}
                    className="rounded-full bg-emerald-400 px-3 py-2 text-xs font-black text-black"
                  >
                    Descancelar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleComplete(item.id)}
                      disabled={item.status === "completed"}
                      className="rounded-full bg-[#d4af37] px-3 py-2 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Concluir
                    </button>

                    <button
                      onClick={() => handleCancel(item.id)}
                      disabled={item.status === "completed"}
                      className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <AppointmentModal
        open={modalOpen}
        appointment={selectedAppointment}
        onClose={closeModal}
      />
    </AppShell>
  );
}
