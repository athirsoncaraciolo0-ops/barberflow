import type { AppointmentStatus } from "@/types";

export function getAppointmentStatusPriority(status: AppointmentStatus) {
  if (status === "scheduled" || status === "confirmed") return 0;
  if (status === "completed") return 1;
  return 2;
}

export function sortAppointmentsByPriority<
  T extends { date: string; time: string; status: AppointmentStatus },
>(appointments: T[]) {
  return [...appointments].sort((a, b) => {
    const statusDiff =
      getAppointmentStatusPriority(a.status) -
      getAppointmentStatusPriority(b.status);

    if (statusDiff !== 0) return statusDiff;

    return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
  });
}

export function normalizePhone(phone?: string | null) {
  let cleanPhone = String(phone ?? "").replace(/\D/g, "");

  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.replace(/^0+/, "");
  }

  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = `55${cleanPhone}`;
  }

  return cleanPhone;
}

export function createWhatsAppClientLink(phone?: string | null) {
  const cleanPhone = normalizePhone(phone);
  return `https://wa.me/${cleanPhone}`;
}

export function createWhatsAppReminderLink(data: {
  phone?: string | null;
  clientName: string;
  date: string;
  time: string;
}) {
  const phone = normalizePhone(data.phone);
  const message = `Ola ${data.clientName}! Lembrete do seu horario hoje as ${data.time}.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
