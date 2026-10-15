import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Rental } from "../types/Rental";

export function useRentals(includeArchived = false) {
  return useQuery<Rental[]>({
    queryKey: ["rentals", includeArchived],
    queryFn: async () => {
      const response = await apiClient.get<Rental[]>(
        includeArchived ? "/rentals?archived=true" : "/rentals",
      );
      return response.data;
    },
  });
}
