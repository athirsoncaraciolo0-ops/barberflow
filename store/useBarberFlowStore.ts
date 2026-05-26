"use client";

import { create } from "zustand";
import { appointments as initialAppointments } from "@/data/appointments";
import { barbers as initialBarbers } from "@/data/barbers";
import { clients as initialClients } from "@/data/clients";
import { services as initialServices } from "@/data/services";
import type {
  Appointment,
  AppointmentStatus,
  Barber,
  BusinessSettings,
  Client,
  FinancialEntry,
  Service,
} from "@/types";
import { businessConfig } from "@/data/business";

type NewAppointment = Omit<Appointment, "id" | "status">;
type AppointmentUpdate = Partial<Omit<Appointment, "id">>;

type StoreResult = {
  success: boolean;
  message: string;
};

type BarberFlowStore = {
  isDatabaseSynced: boolean;
  syncFromDatabase: () => Promise<StoreResult>;
  businessSettings: BusinessSettings;
  clients: Client[];
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  financialEntries: FinancialEntry[];

  updatePublicBusinessSettings: (data: Pick<BusinessSettings, "businessName" | "slogan" | "whatsapp">) => StoreResult;
  updateAdvancedBusinessSettings: (data: Partial<BusinessSettings>) => StoreResult;

  addClient: (client: Omit<Client, "id">) => StoreResult;
  updateClient: (id: string, client: Omit<Client, "id">) => StoreResult;
  removeClient: (id: string) => StoreResult;

  addService: (service: Omit<Service, "id">) => StoreResult;
  updateService: (id: string, service: Omit<Service, "id">) => StoreResult;
  removeService: (id: string) => StoreResult;

  addBarber: (barber: Omit<Barber, "id">) => StoreResult;
  updateBarber: (id: string, barber: Omit<Barber, "id">) => StoreResult;
  removeBarber: (id: string) => StoreResult;

  addFinancialEntry: (entry: Omit<FinancialEntry, "id">) => StoreResult;
  removeFinancialEntry: (id: string) => StoreResult;

  hasAppointmentConflict: (data: {
    id?: string;
    barberId: string;
    date: string;
    time: string;
  }) => boolean;

  addAppointment: (appointment: NewAppointment) => StoreResult;
  updateAppointment: (id: string, data: AppointmentUpdate) => StoreResult;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => StoreResult;
  cancelAppointment: (id: string) => StoreResult;
  completeAppointment: (id: string) => StoreResult;
  restoreAppointment: (id: string) => StoreResult;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isActiveAppointment(status: AppointmentStatus) {
  return status !== "cancelled" && status !== "completed";
}

const defaultBusinessSettings: BusinessSettings = {
  productName: businessConfig.productName,
  businessName: businessConfig.businessName,
  slogan: businessConfig.slogan,
  whatsapp: businessConfig.whatsapp,
  initials: "BF",
  themePresetId: "luxury-gold",
  theme: {
    primary: businessConfig.theme.primary,
    background: businessConfig.theme.background,
    foreground: businessConfig.theme.foreground,
  },
};

export const useBarberFlowStore = create<BarberFlowStore>((set, get) => ({
      isDatabaseSynced: false,
      businessSettings: defaultBusinessSettings,
      clients: initialClients,
      services: initialServices,
      barbers: initialBarbers,
      appointments: initialAppointments,
      financialEntries: [],

      syncFromDatabase: async () => {
        try {
          const response = await fetch("/api/bootstrap", {
            cache: "no-store",
          });

          if (!response.ok) {
            return {
              success: false,
              message: "Não foi possível carregar dados do banco.",
            };
          }

          const data = await response.json();

          set((state) => ({
            ...state,
            isDatabaseSynced: true,
            businessSettings: data.businessSettings
              ? {
                  productName: data.businessSettings.productName,
                  businessName: data.businessSettings.businessName,
                  slogan: data.businessSettings.slogan,
                  whatsapp: data.businessSettings.whatsapp,
                  initials: data.businessSettings.initials,
                  themePresetId: data.businessSettings.themePresetId,
                  theme: {
                    primary: data.businessSettings.primaryColor,
                    background: data.businessSettings.backgroundColor,
                    foreground: data.businessSettings.foregroundColor,
                  },
                }
              : state.businessSettings,
            barbers: data.barbers ?? state.barbers,
            clients: data.clients ?? state.clients,
            services: data.services ?? state.services,
            appointments: data.appointments ?? state.appointments,
            financialEntries: data.financialEntries ?? state.financialEntries,
          }));

          return {
            success: true,
            message: "Dados sincronizados com o banco.",
          };
        } catch {
          return {
            success: false,
            message: "Erro ao sincronizar com o banco.",
          };
        }
      },

      updatePublicBusinessSettings: (data) => {
        set((state) => ({
          businessSettings: {
            ...state.businessSettings,
            businessName: data.businessName,
            slogan: data.slogan,
            whatsapp: data.whatsapp,
          },
        }));

        return { success: true, message: "Informações públicas salvas." };
      },

      updateAdvancedBusinessSettings: (data) => {
        set((state) => ({
          businessSettings: {
            ...defaultBusinessSettings,
            ...state.businessSettings,
            ...data,
            theme: {
              ...defaultBusinessSettings.theme,
              ...state.businessSettings?.theme,
              ...(data.theme ?? {}),
            },
          },
        }));

        return { success: true, message: "Personalização avançada salva." };
      },

      addClient: (client) => {
        set((state) => ({
          clients: [...state.clients, { id: createId("client"), ...client }],
        }));

        return { success: true, message: "Cliente cadastrado com sucesso." };
      },

      updateClient: (id, client) => {
        const exists = get().clients.some((item) => item.id === id);

        if (!exists) {
          return { success: false, message: "Cliente não encontrado." };
        }

        set((state) => ({
          clients: state.clients.map((item) =>
            item.id === id ? { id, ...client } : item
          ),
        }));

        return { success: true, message: "Cliente atualizado com sucesso." };
      },

      removeClient: (id) => {
        const hasActiveAppointments = get().appointments.some(
          (appointment) =>
            appointment.clientId === id && isActiveAppointment(appointment.status)
        );

        if (hasActiveAppointments) {
          return {
            success: false,
            message:
              "Não é possível remover: este cliente possui agendamentos ativos.",
          };
        }

        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
          appointments: state.appointments.filter(
            (appointment) => appointment.clientId !== id
          ),
        }));

        return { success: true, message: "Cliente removido com sucesso." };
      },

      addService: (service) => {
        if (!service.name.trim()) {
          return { success: false, message: "Nome do serviço é obrigatório." };
        }

        if (service.price <= 0) {
          return { success: false, message: "Preço precisa ser maior que zero." };
        }

        if (service.durationMinutes <= 0) {
          return { success: false, message: "Duração precisa ser maior que zero." };
        }

        set((state) => ({
          services: [...state.services, { id: createId("service"), ...service }],
        }));

        return { success: true, message: "Serviço cadastrado com sucesso." };
      },

      updateService: (id, service) => {
        const exists = get().services.some((item) => item.id === id);

        if (!exists) {
          return { success: false, message: "Serviço não encontrado." };
        }

        if (!service.name.trim()) {
          return { success: false, message: "Nome do serviço é obrigatório." };
        }

        if (service.price <= 0) {
          return { success: false, message: "Preço precisa ser maior que zero." };
        }

        if (service.durationMinutes <= 0) {
          return { success: false, message: "Duração precisa ser maior que zero." };
        }

        set((state) => ({
          services: state.services.map((item) =>
            item.id === id ? { id, ...service } : item
          ),
        }));

        return { success: true, message: "Serviço atualizado com sucesso." };
      },

      removeService: (id) => {
        const hasActiveAppointments = get().appointments.some(
          (appointment) =>
            appointment.serviceId === id &&
            isActiveAppointment(appointment.status)
        );

        if (hasActiveAppointments) {
          set((state) => ({
            services: state.services.map((service) =>
              service.id === id ? { ...service, active: false } : service
            ),
          }));

          return {
            success: true,
            message:
              "Serviço possui agendamentos ativos, então foi apenas desativado.",
          };
        }

        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
          appointments: state.appointments.filter(
            (appointment) => appointment.serviceId !== id
          ),
        }));

        return { success: true, message: "Serviço removido com sucesso." };
      },

      addBarber: (barber) => {
        if (!barber.name.trim()) {
          return { success: false, message: "Nome do barbeiro é obrigatório." };
        }

        if (!barber.specialty.trim()) {
          return { success: false, message: "Especialidade é obrigatória." };
        }

        set((state) => ({
          barbers: [...state.barbers, { id: createId("barber"), ...barber }],
        }));

        return { success: true, message: "Barbeiro cadastrado com sucesso." };
      },

      updateBarber: (id, barber) => {
        const exists = get().barbers.some((item) => item.id === id);

        if (!exists) {
          return { success: false, message: "Barbeiro não encontrado." };
        }

        if (!barber.name.trim()) {
          return { success: false, message: "Nome do barbeiro é obrigatório." };
        }

        if (!barber.specialty.trim()) {
          return { success: false, message: "Especialidade é obrigatória." };
        }

        set((state) => ({
          barbers: state.barbers.map((item) =>
            item.id === id ? { id, ...barber } : item
          ),
        }));

        return { success: true, message: "Barbeiro atualizado com sucesso." };
      },

      removeBarber: (id) => {
        const hasActiveAppointments = get().appointments.some(
          (appointment) =>
            appointment.barberId === id && isActiveAppointment(appointment.status)
        );

        if (hasActiveAppointments) {
          set((state) => ({
            barbers: state.barbers.map((barber) =>
              barber.id === id ? { ...barber, active: false } : barber
            ),
          }));

          return {
            success: true,
            message:
              "Barbeiro possui agendamentos ativos, então foi apenas desativado.",
          };
        }

        set((state) => ({
          barbers: state.barbers.filter((barber) => barber.id !== id),
          appointments: state.appointments.filter(
            (appointment) => appointment.barberId !== id
          ),
        }));

        return { success: true, message: "Barbeiro removido com sucesso." };
      },

      addFinancialEntry: (entry) => {
        if (!entry.description.trim()) {
          return { success: false, message: "Descrição é obrigatória." };
        }

        if (entry.amount <= 0) {
          return { success: false, message: "Valor precisa ser maior que zero." };
        }

        if (entry.scope === "barber" && !entry.barberId) {
          return { success: false, message: "Selecione um barbeiro." };
        }

        set((state) => ({
          financialEntries: [
            ...state.financialEntries,
            { id: createId("financial"), ...entry },
          ],
        }));

        return { success: true, message: "Lançamento financeiro salvo." };
      },

      removeFinancialEntry: (id) => {
        set((state) => ({
          financialEntries: state.financialEntries.filter((entry) => entry.id !== id),
        }));

        return { success: true, message: "Lançamento removido." };
      },

      hasAppointmentConflict: ({ id, barberId, date, time }) => {
        return get().appointments.some((appointment) => {
          if (appointment.id === id) return false;
          if (!isActiveAppointment(appointment.status)) return false;

          return (
            appointment.barberId === barberId &&
            appointment.date === date &&
            appointment.time === time
          );
        });
      },

      addAppointment: (appointment) => {
        const hasConflict = get().hasAppointmentConflict({
          barberId: appointment.barberId,
          date: appointment.date,
          time: appointment.time,
        });

        if (hasConflict) {
          return {
            success: false,
            message:
              "Este barbeiro já possui um agendamento ativo nesse dia e horário.",
          };
        }

        set((state) => ({
          appointments: [
            ...state.appointments,
            {
              id: createId("appointment"),
              status: "scheduled",
              ...appointment,
            },
          ],
        }));

        return { success: true, message: "Agendamento criado com sucesso." };
      },

      updateAppointment: (id, data) => {
        const currentAppointment = get().appointments.find(
          (appointment) => appointment.id === id
        );

        if (!currentAppointment) {
          return { success: false, message: "Agendamento não encontrado." };
        }

        const nextAppointment = { ...currentAppointment, ...data };

        if (isActiveAppointment(nextAppointment.status)) {
          const hasConflict = get().hasAppointmentConflict({
            id,
            barberId: nextAppointment.barberId,
            date: nextAppointment.date,
            time: nextAppointment.time,
          });

          if (hasConflict) {
            return {
              success: false,
              message:
                "Não foi possível alterar: este barbeiro já possui outro agendamento ativo nesse dia e horário.",
            };
          }
        }

        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id ? nextAppointment : appointment
          ),
        }));

        return { success: true, message: "Agendamento atualizado com sucesso." };
      },

      updateAppointmentStatus: (id, status) => {
        const currentAppointment = get().appointments.find(
          (appointment) => appointment.id === id
        );

        if (!currentAppointment) {
          return { success: false, message: "Agendamento não encontrado." };
        }

        if (isActiveAppointment(status)) {
          const hasConflict = get().hasAppointmentConflict({
            id,
            barberId: currentAppointment.barberId,
            date: currentAppointment.date,
            time: currentAppointment.time,
          });

          if (hasConflict) {
            return {
              success: false,
              message:
                "Não foi possível ativar: existe conflito com outro agendamento ativo.",
            };
          }
        }

        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, status } : appointment
          ),
        }));

        return { success: true, message: "Status atualizado com sucesso." };
      },

      cancelAppointment: (id) => get().updateAppointmentStatus(id, "cancelled"),
      completeAppointment: (id) => get().updateAppointmentStatus(id, "completed"),
      restoreAppointment: (id) => get().updateAppointmentStatus(id, "scheduled"),
}));
