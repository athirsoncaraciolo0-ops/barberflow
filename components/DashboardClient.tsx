"use client";

import { useMemo, useState } from "react";
import { businessConfig } from "@/data/business";
import { verses } from "@/data/verses";
import { sortAppointmentsByPriority, createWhatsAppReminderLink } from "@/lib/appointments";
import { formatCurrency } from "@/lib/format";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";

const ITEMS_PER_PAGE = 5;

function getTodayISODate() {
  return "2026-05-26";
}

function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  return verses[dayOfYear % verses.length];
}

export function DashboardClient() {
  const { appointments, clients, services, barbers } = useBarberFlowStore();
  const [selectedBarberId, setSelectedBarberId] = useState("all");
  const [page, setPage] = useState(1);

  const today = getTodayISODate();
  const verse = getDailyVerse();

  const dashboard = useMemo(() => {
    const todayAppointments = appointments.filter((appointment) => {
      const isToday = appointment.date === today;
      const matchesBarber =
        selectedBarberId === "all" || appointment.barberId === selectedBarberId;

      return isToday && matchesBarber;
    });

    const completedAppointments = todayAppointments.filter(
      (appointment) => appointment.status === "completed"
    );

    const dailyRevenue = completedAppointments.reduce((total, appointment) => {
      const service = services.find((item) => item.id === appointment.serviceId);
      return total + (service?.price ?? 0);
    }, 0);

    const enrichedAppointments = sortAppointmentsByPriority(
      todayAppointments.map((appointment) => {
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

    return {
      appointments: enrichedAppointments,
      todayAppointments: todayAppointments.length,
      completedCount: completedAppointments.length,
      dailyRevenue,
      totalClients: clients.length,
    };
  }, [appointments, barbers, clients, selectedBarberId, services, today]);

  const totalPages = Math.max(1, Math.ceil(dashboard.appointments.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleAppointments = dashboard.appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.10] to-white/[0.03] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Gestão elegante para barbearias que querem vender mais.
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
                Próximos horários ficam no topo. Concluídos e cancelados descem automaticamente.
              </p>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">Filtrar barbeiro</span>
              <select
                value={selectedBarberId}
                onChange={(event) => {
                  setSelectedBarberId(event.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
              >
                <option value="all">Todos</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card label="Agendamentos hoje" value={String(dashboard.todayAppointments)} />
            <Card label="Faturamento concluído" value={formatCurrency(dashboard.dailyRevenue)} />
            <Card label="Atendidos hoje" value={String(dashboard.completedCount)} />
            <Card label="Clientes cadastrados" value={String(dashboard.totalClients)} />
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#d4af37]/25 bg-[#111]/90 p-6 shadow-2xl shadow-black/40">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37]">
            Versículo do dia
          </p>
          <blockquote className="mt-6 text-2xl font-bold leading-snug">
            “{verse.text}”
          </blockquote>
          <p className="mt-5 text-zinc-400">{verse.reference}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-zinc-600">
            {businessConfig.businessName}
          </p>
        </aside>
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-2xl font-black">Atendimentos de hoje</h3>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="rounded-xl border border-[#d4af37]/20 px-3 py-2 text-sm text-[#d4af37]">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {visibleAppointments.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 sm:grid-cols-[80px_1fr_auto] sm:items-center"
            >
              <p className="text-2xl font-black text-[#d4af37]">{item.time}</p>

              <div>
                <h4 className="font-bold">{item.clientName}</h4>
                <p className="text-sm text-zinc-400">
                  {item.serviceName} • {item.barberName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {item.clientPhone && (
                  <a
                    href={createWhatsAppReminderLink(item)}
                    target="_blank"
                    className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-black text-black"
                  >
                    WhatsApp
                  </a>
                )}

                <strong className="text-[#d4af37]">
                  {item.status === "completed"
                    ? formatCurrency(item.servicePrice)
                    : "Pendente"}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <strong className="mt-3 block text-3xl font-black text-[#d4af37]">
        {value}
      </strong>
    </article>
  );
}
