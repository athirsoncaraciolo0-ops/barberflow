export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled";

export type Barber = {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  active: boolean;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  active: boolean;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  notes?: string | null;
};

export type Appointment = {
  id: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
};

export type Verse = {
  text: string;
  reference: string;
};

export type FinancialEntryType = "income" | "expense";

export type FinancialEntryScope = "all" | "barber";

export type FinancialEntry = {
  id: string;
  type: FinancialEntryType;
  description: string;
  amount: number;
  date: string;
  scope: FinancialEntryScope;
  barberId?: string | null;
};

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  primary: string;
  background: string;
  foreground: string;
};

export type BusinessSettings = {
  productName: string;
  businessName: string;
  slogan: string;
  whatsapp: string;
  initials: string;
  themePresetId: string;
  theme: {
    primary: string;
    background: string;
    foreground: string;
  };
};
