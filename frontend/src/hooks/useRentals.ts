import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Rental } from "../types/Rental";

export function useRentals() {
  return useQuery<Rental[]>({
    queryKey: ["rentals"],
    queryFn: async () => {
      const response = await apiClient.get<Rental[]>("/rentals");
      return response.data;
    },
  });
}
