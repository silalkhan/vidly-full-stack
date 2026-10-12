import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const response = await apiClient.delete(`/customers/${customerId}`);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
