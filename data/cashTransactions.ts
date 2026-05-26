import type { CashTransaction } from "@/types";

export const cashTransactions: CashTransaction[] = [
  {
    id: "cash-1",
    type: "expense",
    scope: "all",
    description: "Compra de lâminas",
    amount: 60,
    date: "2026-05-26",
    createdAt: "2026-05-26T08:00:00.000Z",
  },
  {
    id: "cash-2",
    type: "income",
    scope: "all",
    description: "Venda de pomada modeladora",
    amount: 35,
    date: "2026-05-26",
    createdAt: "2026-05-26T11:00:00.000Z",
  },
];
