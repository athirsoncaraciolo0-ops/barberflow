"use client";

import { useEffect } from "react";

export function ClearLocalStorage() {
  useEffect(() => {
    localStorage.removeItem("barberflow-store");
  }, []);

  return null;
}
