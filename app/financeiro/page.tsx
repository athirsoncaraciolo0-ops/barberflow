"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { formatCurrency } from "@/lib/format";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";
import type { FinancialEntryScope, FinancialEntryType } from "@/types";

const TODAY = "2026-05-26";

export default function FinanceiroPage() {
  const {
    appointments,
    clients,
    services,
    barbers,
    financialEntries,
    addFinancialEntry,
    removeFinancialEntry,
  } = useBarberFlowStore();

  const [selectedBarberId, setSelectedBarberId] = useState("all");
  const [type, setType] = useState<FinancialEntryType>("expense");
  const [scope, setScope] = useState<FinancialEntryScope>("all");
  const [barberId, setBarberId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(TODAY);
  const [message, setMessage] = useState("");

  const activeBarbers = barbers.filter((barber) => barber.active);
  const activeBarbersCount = Math.max(activeBarbers.length, 1);

  const finance = useMemo(() => {
    const completedAppointments = appointments
      .filter((appointment) => {
        const matchesDate = appointment.date === TODAY;
        const isCompleted = appointment.status === "completed";
        const matchesBarber =
          selectedBarberId === "all" ||
          appointment.barberId === selectedBarberId;

        return matchesDate && isCompleted && matchesBarber;
      })
      .map((appointment) => {
        const service = services.find((item) => item.id === appointment.serviceId);
        const barber = barbers.find((item) => item.id === appointment.barberId);
        const client = clients.find((item) => item.id === appointment.clientId);

        return {
          id: appointment.id,
          type: "service" as const,
          description: service?.name ?? "Serviço não encontrado",
          amount: service?.price ?? 0,
          date: appointment.date,
          time: appointment.time,
          barberName: barber?.name ?? "Barbeiro não encontrado",
          clientName: client?.name ?? "Cliente não encontrado",
        };
      });

    const automaticIncome = completedAppointments.reduce(
      (total, item) => total + item.amount,
      0
    );

    const manualEntries = financialEntries
      .filter((entry) => {
        if (entry.date !== TODAY) return false;
        if (selectedBarberId === "all") return true;
        if (entry.scope === "barber") return entry.barberId === selectedBarberId;
        return entry.scope === "all";
      })
      .map((entry) => {
        const isShared = selectedBarberId !== "all" && entry.scope === "all";
        const displayAmount = isShared
          ? entry.amount / activeBarbersCount
          : entry.amount;

        const barber = barbers.find((item) => item.id === entry.barberId);

        return {
          ...entry,
          displayAmount,
          isShared,
          barberName:
            entry.scope === "all"
              ? "Todos os barbeiros"
              : barber?.name ?? "Barbeiro não encontrado",
        };
      });

    const manualIncome = manualEntries
      .filter((entry) => entry.type === "income")
      .reduce((total, entry) => total + entry.displayAmount, 0);

    const expenses = manualEntries
      .filter((entry) => entry.type === "expense")
      .reduce((total, entry) => total + entry.displayAmount, 0);

    const grossIncome = automaticIncome + manualIncome;
    const netIncome = grossIncome - expenses;
    const averageTicket =
      completedAppointments.length > 0
        ? automaticIncome / completedAppointments.length
        : 0;

    const statement = [
      ...completedAppointments.map((item) => ({
        id: item.id,
        kind: "service" as const,
        title: item.description,
        subtitle:
          selectedBarberId === "all"
            ? `${item.clientName} • ${item.barberName}`
            : item.clientName,
        amount: item.amount,
        date: item.date,
        time: item.time,
        positive: true,
      })),
      ...manualEntries.map((entry) => ({
        id: entry.id,
        kind: entry.type,
        title: entry.description,
        subtitle: entry.isShared
          ? `Rateado entre ${activeBarbersCount} barbeiro(s). Valor original: ${formatCurrency(entry.amount)}`
          : entry.barberName,
        amount: entry.displayAmount,
        originalAmount: entry.amount,
        date: entry.date,
        time: "",
        positive: entry.type === "income",
      })),
    ];

    return {
      automaticIncome,
      manualIncome,
      grossIncome,
      expenses,
      netIncome,
      averageTicket,
      completedCount: completedAppointments.length,
      statement,
    };
  }, [
    activeBarbersCount,
    appointments,
    barbers,
    clients,
    financialEntries,
    selectedBarberId,
    services,
  ]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = addFinancialEntry({
      type,
      description,
      amount: Number(amount),
      date,
      scope,
      barberId: scope === "barber" ? barberId : undefined,
    });

    setMessage(result.message);

    if (result.success) {
      setDescription("");
      setAmount("");
      setType("expense");
      setScope("all");
      setBarberId("");
      setDate(TODAY);
    }
  }

  function handleRemove(id: string) {
    const result = removeFinancialEntry(id);
    setMessage(result.message);
  }

  return (
    <AppShell
      title="Financeiro"
      description="Resumo financeiro por barbeiro ou geral, com entradas, sangrias e serviços concluídos."
    >
      <section className="rounded-[2rem] border border-[#d4af37]/20 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37]">
              Resumo financeiro
            </p>
            <h3 className="mt-2 text-3xl font-black">
              {selectedBarberId === "all"
                ? "Todos os barbeiros"
                : barbers.find((barber) => barber.id === selectedBarberId)?.name}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Selecione um barbeiro para ver faturamento, rateios e sangrias individuais.
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">Visualizar</span>
            <select
              value={selectedBarberId}
              onChange={(event) => setSelectedBarberId(event.target.value)}
              className="min-w-64 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card label="Faturamento bruto" value={formatCurrency(finance.grossIncome)} />
          <Card label="Serviços concluídos" value={String(finance.completedCount)} />
          <Card label="Entradas extras" value={formatCurrency(finance.manualIncome)} />
          <Card label="Sangrias/despesas" value={formatCurrency(finance.expenses)} />
          <Card label="Líquido" value={formatCurrency(finance.netIncome)} />
        </div>

        <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-400">
          Ticket médio dos serviços concluídos:{" "}
          <strong className="text-[#d4af37]">
            {formatCurrency(finance.averageTicket)}
          </strong>
        </p>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
        >
          <h3 className="text-2xl font-black">Novo lançamento</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Adicione entrada extra ou sangria/despesa.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">Tipo</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as FinancialEntryType)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                <option value="income">Entrada</option>
                <option value="expense">Sangria / Despesa</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">Descrição</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: compra de material, venda de pomada..."
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-zinc-300">Valor</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-zinc-300">Data</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">Aplicar em</span>
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as FinancialEntryScope)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                <option value="all">Todos os barbeiros</option>
                <option value="barber">Barbeiro específico</option>
              </select>
            </label>

            {scope === "barber" && (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-zinc-300">Barbeiro</span>
                <select
                  value={barberId}
                  onChange={(event) => setBarberId(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                >
                  <option value="">Selecione</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {scope === "all" && (
              <p className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#d4af37]">
                Este lançamento será rateado entre {activeBarbersCount} barbeiro(s) ativo(s) quando visualizar individualmente.
              </p>
            )}

            {message && (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                {message}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setDescription("");
                  setAmount("");
                  setType("expense");
                  setScope("all");
                  setBarberId("");
                  setDate(TODAY);
                  setMessage("");
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 font-black text-white"
              >
                Cancelar
              </button>

              <button className="rounded-2xl bg-[#d4af37] px-5 py-4 font-black text-black shadow-lg shadow-[#d4af37]/20">
                Salvar lançamento
              </button>
            </div>
          </div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
          <h3 className="text-2xl font-black">Extrato do dia</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Serviços prestados, entradas e sangrias do filtro selecionado.
          </p>

          <div className="mt-5 grid gap-3">
            {finance.statement.length === 0 && (
              <p className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
                Nenhum movimento para hoje.
              </p>
            )}

            {finance.statement.map((entry) => (
              <article
                key={`${entry.kind}-${entry.id}`}
                className="grid gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <h4 className="font-black">{entry.title}</h4>
                  <p className="mt-1 text-sm text-zinc-400">
                    {entry.subtitle}
                    {entry.time ? ` • ${entry.time}` : ""}
                  </p>
                </div>

                <strong className={entry.positive ? "text-emerald-300" : "text-red-300"}>
                  {entry.positive ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </strong>

                {entry.kind === "service" ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-200">
                    Serviço
                  </span>
                ) : (
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200"
                  >
                    Remover
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-black/25 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <strong className="mt-4 block text-2xl font-black text-[#d4af37]">
        {value}
      </strong>
    </article>
  );
}
