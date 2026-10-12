import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Customer } from "../types/Customer";

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => apiClient.get("/customers").then((res) => res.data),
  });
}
