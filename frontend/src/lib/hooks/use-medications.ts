import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMedications,
  createMedication,
  deleteMedication,
} from "@/lib/api";
import type { MedicationCreate } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useMedications() {
  return useQuery({
    queryKey: ["medications"],
    queryFn: () => getMedications(true),
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: MedicationCreate) => createMedication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast({ title: "Medication added", description: "Medication saved successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast({ title: "Medication removed", description: "Medication deactivated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
