import { AppShell } from "@/components/AppShell";
import { DashboardClient } from "@/components/DashboardClient";

export default function Home() {
  return (
    <AppShell
      title="Dashboard premium"
      description="Resumo diário da operação, faturamento concluído, equipe e versículo do dia."
    >
      <DashboardClient />
    </AppShell>
  );
}
