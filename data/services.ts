import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "service-1",
    name: "Corte degradê",
    price: 45,
    durationMinutes: 40,
    active: true,
  },
  {
    id: "service-2",
    name: "Corte + barba",
    price: 80,
    durationMinutes: 60,
    active: true,
  },
  {
    id: "service-3",
    name: "Barba premium",
    price: 40,
    durationMinutes: 35,
    active: true,
  },
  {
    id: "service-4",
    name: "Combo imperial",
    price: 120,
    durationMinutes: 90,
    active: true,
  },
];
