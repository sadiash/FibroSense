import { useQuery } from "@tanstack/react-query";
import { getBiometrics, getContextualData } from "@/lib/api";

export function useBiometrics() {
  return useQuery({
    queryKey: ["biometrics"],
    queryFn: getBiometrics,
  });
}

export function useContextualData() {
  return useQuery({
    queryKey: ["contextual-data"],
    queryFn: getContextualData,
  });
}
