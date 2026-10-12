
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Customer } from "../types/Customer";
//This means: take all the properties from Customer, except _id
//CustomerData excludes _id because MongoDB generates the ID when creating a customer.
type CustomerData = Omit<Customer, "_id">;

export function useAddCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customer: CustomerData) =>
        //apiClient.post() sends name, phone, and isGold to your backend.
      apiClient.post<Customer>("/customers", customer).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
//invalidateQueries() tells TanStack Query to refresh the cached customers list.