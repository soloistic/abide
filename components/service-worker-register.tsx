"use client";

import { useEffect } from "react";
import { registerAbideServiceWorker } from "@/lib/service-worker";

export function ServiceWorkerRegister() {
  useEffect(() => {
    registerAbideServiceWorker().catch(() => {
      // Offline support is a gentle enhancement; the journal works without it.
    });
  }, []);

  return null;
}
