import { appointments } from "@/data/appointments";
import { barbers } from "@/data/barbers";
import { clients } from "@/data/clients";
import { services } from "@/data/services";
import { verses } from "@/data/verses";

export function getTodayISODate() {
  return "2026-05-26";
}

export function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  return verses[dayOfYear % verses.length];
}

export function getDashboardData() {
  const today = getTodayISODate();

  const todayAppointments = appointments
    .filter((appointment) => appointment.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const completedAppointments = todayAppointments.filter(
    (appointment) => appointment.status === "completed" || appointment.status === "confirmed"
  );

  const dailyRevenue = completedAppointments.reduce((total, appointment) => {
    const service = services.find((item) => item.id === appointment.serviceId);
    return total + (service?.price ?? 0);
  }, 0);

  const enrichedAppointments = todayAppointments.map((appointment) => {
    const client = clients.find((item) => item.id === appointment.clientId);
    const barber = barbers.find((item) => item.id === appointment.barberId);
    const service = services.find((item) => item.id === appointment.serviceId);

    return {
      ...appointment,
      clientName: client?.name ?? "Cliente não encontrado",
      clientPhone: client?.phone ?? "",
      barberName: barber?.name ?? "Barbeiro não encontrado",
      serviceName: service?.name ?? "Serviço não encontrado",
      servicePrice: service?.price ?? 0,
      serviceDuration: service?.durationMinutes ?? 0,
    };
  });

  return {
    today,
    verse: getDailyVerse(),
    stats: {
      todayAppointments: todayAppointments.length,
      dailyRevenue,
      totalClients: clients.length,
      activeServices: services.filter((service) => service.active).length,
    },
    appointments: enrichedAppointments,
    barbers,
    services,
  };
}
