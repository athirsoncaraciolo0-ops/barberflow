import type { Appointment } from "@/types";

export const appointments: Appointment[] = [
  {
    id: "appointment-1",
    clientId: "client-1",
    barberId: "barber-1",
    serviceId: "service-1",
    date: "2026-05-26",
    time: "09:00",
    status: "confirmed",
  },
  {
    id: "appointment-2",
    clientId: "client-2",
    barberId: "barber-2",
    serviceId: "service-2",
    date: "2026-05-26",
    time: "10:30",
    status: "scheduled",
  },
  {
    id: "appointment-3",
    clientId: "client-3",
    barberId: "barber-1",
    serviceId: "service-3",
    date: "2026-05-26",
    time: "13:00",
    status: "scheduled",
  },
  {
    id: "appointment-4",
    clientId: "client-4",
    barberId: "barber-3",
    serviceId: "service-4",
    date: "2026-05-26",
    time: "15:30",
    status: "confirmed",
  },
];
