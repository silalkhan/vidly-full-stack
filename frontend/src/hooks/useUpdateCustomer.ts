import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Customer } from "../types/Customer";

type CustomerData = Omit<Customer, "_id">;

interface UpdateCustomerVariables {
  id: string;
  customer: CustomerData;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customer }: UpdateCustomerVariables) => {
      const response = await apiClient.put<Customer>(
        `/customers/${id}`,
        customer,
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
