import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSymptomLogs, createSymptomLog } from "@/lib/api";
import { SymptomLogCreate } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useSymptomLogs() {
  return useQuery({
    queryKey: ["symptom-logs"],
    queryFn: getSymptomLogs,
  });
}

export function useCreateSymptomLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: SymptomLogCreate) => createSymptomLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptom-logs"] });
      toast({ title: "Entry saved", description: "Symptom log recorded successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
