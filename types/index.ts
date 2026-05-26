export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

export type Barber = {
  id: string;
  name: string;
  specialty: string;
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
  notes?: string;
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

export type CashTransactionType = "income" | "expense";

export type CashTransactionScope = "all" | "barber";

export type CashTransaction = {
  id: string;
  type: CashTransactionType;
  scope: CashTransactionScope;
  barberId?: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
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
  barberId?: string;
};


export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  panel: string;
  foreground: string;
  accent: string;
};

export type BusinessSettings = {
  productName: string;
  businessName: string;
  slogan: string;
  whatsapp: string;
  initials: string;
  themePresetId: string;
  customPrimary: string;
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
