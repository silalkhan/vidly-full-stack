import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Rental } from "../types/Rental";

interface ReturnRentalData {
  customerId?: string;
  movieId?: string;
  rentalId?: string;
}

export function useReturnRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReturnRentalData) => {
      const url = data.customerId ? "/returns" : "/returns/me";
      const payload = data.customerId
        ? { customerId: data.customerId, movieId: data.movieId }
        : data.rentalId
          ? { rentalId: data.rentalId }
          : { movieId: data.movieId };
      const response = await apiClient.post<Rental>(url, payload);
      return response.data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rentals"] }),
        queryClient.invalidateQueries({ queryKey: ["my-rentals"] }),
        queryClient.invalidateQueries({ queryKey: ["movies"] }),
      ]);
    },
  });
}
