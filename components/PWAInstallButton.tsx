"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
};

export function PWAInstallButton() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handler(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function installedHandler() {
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;

    await promptEvent.prompt();
    await promptEvent.userChoice;

    setPromptEvent(null);
  }

  if (installed) return null;

  if (!promptEvent) {
    return (
      <button
        type="button"
        className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white"
        onClick={() => {
          alert(
            "No seu aparelho, abra o menu do Chrome (⋮) e toque em 'Adicionar à tela inicial'."
          );
        }}
      >
        Instalar app
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={install}
      className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-black shadow-lg"
    >
      Instalar app
    </button>
  );
}
