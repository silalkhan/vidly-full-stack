import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Rental } from "../types/Rental";

interface ReturnRentalData {
  customerId: string;
  movieId: string;
}

export function useReturnRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReturnRentalData) => {
      const response = await apiClient.post<Rental>("/returns", data);
      return response.data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rentals"] }),
        queryClient.invalidateQueries({ queryKey: ["movies"] }),
      ]);
    },
  });
}
