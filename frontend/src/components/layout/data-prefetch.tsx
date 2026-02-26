"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSymptomLogs, getBiometrics, getContextualData, getCorrelationMatrix } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function DataPrefetch() {
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Prefetch all core data on app load so pages render instantly
    qc.prefetchQuery({ queryKey: ["symptom-logs"], queryFn: getSymptomLogs });
    qc.prefetchQuery({ queryKey: ["biometrics"], queryFn: getBiometrics });
    qc.prefetchQuery({ queryKey: ["contextual-data"], queryFn: getContextualData });
    qc.prefetchQuery({ queryKey: ["correlation-matrix"], queryFn: getCorrelationMatrix });
  }, [qc, isAuthenticated]);

  return null;
}
