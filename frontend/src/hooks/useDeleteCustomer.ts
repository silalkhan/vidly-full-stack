
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/customers/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}