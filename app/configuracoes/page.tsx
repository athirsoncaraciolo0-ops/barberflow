"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { themePresets } from "@/data/themePresets";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";

const ADMIN_PASSWORD = "0500";

function applyThemeNow(theme: {
  primary: string;
  background: string;
  foreground: string;
}) {
  document.documentElement.style.setProperty("--bf-primary", theme.primary);
  document.documentElement.style.setProperty("--bf-background", theme.background);
  document.documentElement.style.setProperty("--bf-foreground", theme.foreground);
  document.body.style.background = theme.background;
  document.body.style.color = theme.foreground;
}

export default function ConfiguracoesPage() {
  const {
    businessSettings,
    syncFromDatabase,
  } = useBarberFlowStore();

  const [businessName, setBusinessName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [initials, setInitials] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBusinessName(businessSettings.businessName);
    setSlogan(businessSettings.slogan);
    setWhatsapp(businessSettings.whatsapp);
    setInitials(businessSettings.initials);
    applyThemeNow(businessSettings.theme);
  }, [businessSettings]);

  function finishSave(text: string, shouldReload = false) {
    setMessage(text);
    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      if (shouldReload) {
        window.location.reload();
      }
    }, 500);
  }

  async function savePublicSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...businessSettings,
        businessName: businessName.trim(),
        slogan: slogan.trim(),
        whatsapp: whatsapp.trim(),
        primaryColor: businessSettings.theme.primary,
        backgroundColor: businessSettings.theme.background,
        foregroundColor: businessSettings.theme.foreground,
      }),
    });

    const result = await response.json();

    if (result.success) {
      await syncFromDatabase();
    }

    finishSave(result.message, true);
  }

  function unlockAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (adminPassword !== ADMIN_PASSWORD) {
      setMessage("Senha incorreta.");
      return;
    }

    setAdminUnlocked(true);
    setAdminPassword("");
    setMessage("Área avançada liberada.");
  }

  async function applyPreset(presetId: string) {
    const preset = themePresets.find((item) => item.id === presetId);
    if (!preset) return;

    const theme = {
      primary: preset.primary,
      background: preset.background,
      foreground: preset.foreground,
    };

    applyThemeNow(theme);

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...businessSettings,
        initials: initials.trim().toUpperCase() || businessSettings.initials || "BF",
        themePresetId: preset.id,
        primaryColor: theme.primary,
        backgroundColor: theme.background,
        foregroundColor: theme.foreground,
      }),
    });

    const result = await response.json();

    if (result.success) {
      await syncFromDatabase();
    }

    finishSave(result.success ? `Tema aplicado: ${preset.name}` : result.message, true);
  }

  async function saveAdvancedSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...businessSettings,
        initials: initials.trim().toUpperCase() || "BF",
        primaryColor: businessSettings.theme.primary,
        backgroundColor: businessSettings.theme.background,
        foregroundColor: businessSettings.theme.foreground,
      }),
    });

    const result = await response.json();

    if (result.success) {
      await syncFromDatabase();
    }

    finishSave(result.message, true);
  }

  return (
    <AppShell
      title="Configurações"
      description="Personalização pública e área avançada protegida para ajustes do produto."
    >
      {saving && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="rounded-[2rem] border border-[var(--bf-primary)]/30 bg-[#101010] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-white/20 border-t-[var(--bf-primary)]" />
            <p className="font-black text-[var(--bf-primary)]">
              Salvando alterações...
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={savePublicSettings}
          className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30"
        >
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--bf-primary)]">
            Configuração pública
          </p>

          <h3 className="mt-2 text-2xl font-black">Dados da barbearia</h3>

          <div className="mt-5 grid gap-4">
            <Field label="Nome da barbearia">
              <input
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Slogan">
              <input
                value={slogan}
                onChange={(event) => setSlogan(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Telefone/WhatsApp">
              <input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </Field>

            <button className="rounded-2xl bg-[var(--bf-primary)] px-5 py-4 font-black text-black shadow-lg">
              Salvar dados públicos
            </button>
          </div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--bf-primary)]">
            Área avançada
          </p>

          <h3 className="mt-2 text-2xl font-black">Personalização premium</h3>

          {!adminUnlocked ? (
            <form onSubmit={unlockAdmin} className="mt-5 grid gap-4">
              <p className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-400">
                Informe a senha para liberar temas, cores, iniciais e presets.
              </p>

              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder="Senha"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />

              <button className="rounded-2xl bg-[var(--bf-primary)] px-5 py-4 font-black text-black">
                Liberar área avançada
              </button>
            </form>
          ) : (
            <div className="mt-5 grid gap-5">
              <form onSubmit={saveAdvancedSettings} className="grid gap-4">
                <Field label="Iniciais/logo texto">
                  <input
                    value={initials}
                    maxLength={4}
                    onChange={(event) => setInitials(event.target.value.toUpperCase())}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />
                </Field>

                <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 font-black text-white">
                  Salvar iniciais
                </button>
              </form>

              <div className="grid gap-4">
                <h4 className="text-xl font-black">Pré-personalizações</h4>

                <div className="grid gap-4 md:grid-cols-2">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 text-left transition hover:border-[var(--bf-primary)]"
                    >
                      <div
                        className="mb-4 h-14 rounded-2xl border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${preset.background}, ${preset.primary})`,
                        }}
                      />

                      <h5 className="font-black">{preset.name}</h5>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        {preset.description}
                      </p>

                      {businessSettings.themePresetId === preset.id && (
                        <p className="mt-3 text-sm font-bold text-[var(--bf-primary)]">
                          Estilo ativo
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </section>

      {message && (
        <p className="mt-5 rounded-2xl border border-[var(--bf-primary)]/20 bg-white/[0.04] px-4 py-3 text-sm font-bold text-[var(--bf-primary)]">
          {message}
        </p>
      )}
    </AppShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
