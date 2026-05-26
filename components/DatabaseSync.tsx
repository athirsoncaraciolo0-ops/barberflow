"use client";

import { useEffect, useState } from "react";
import { useBarberFlowStore } from "@/store/useBarberFlowStore";

export function DatabaseSync() {
  const syncFromDatabase = useBarberFlowStore((state) => state.syncFromDatabase);
  const isDatabaseSynced = useBarberFlowStore((state) => state.isDatabaseSynced);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isDatabaseSynced) return;

    syncFromDatabase().then((result) => {
      if (!result.success) {
        setMessage(result.message);
      }
    });
  }, [isDatabaseSynced, syncFromDatabase]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 shadow-2xl sm:left-auto sm:max-w-md">
      {message}
    </div>
  );
}
