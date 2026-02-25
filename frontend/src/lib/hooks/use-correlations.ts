import { useQuery } from "@tanstack/react-query";
import { getCorrelationMatrix, getLaggedCorrelations } from "@/lib/api";

export function useCorrelationMatrix() {
  return useQuery({
    queryKey: ["correlation-matrix"],
    queryFn: getCorrelationMatrix,
  });
}

export function useLaggedCorrelations(
  metricA: string,
  metricB: string,
  maxLag: number = 7
) {
  return useQuery({
    queryKey: ["lagged-correlations", metricA, metricB, maxLag],
    queryFn: () => getLaggedCorrelations(metricA, metricB, maxLag),
    enabled: !!metricA && !!metricB,
  });
}
