import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Rental } from "../types/Rental";

export function useMyRentals() {
  return useQuery<Rental[]>({
    queryKey: ["my-rentals"],
    queryFn: async () => {
      const response = await apiClient.get<Rental[]>("/rentals/me", {
        timeout: 15_000,
      });
      return response.data;
    },
    retry: false,
  });
}
