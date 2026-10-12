import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Rental } from "../types/Rental";

export interface NewRental {
  customerId: string;
  movieId: string;
}

export function useAddRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rental: NewRental) => {
      const response = await apiClient.post<Rental>("/rentals", rental);
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
