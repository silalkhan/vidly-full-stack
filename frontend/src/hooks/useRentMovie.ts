import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Rental } from "../types/Rental";

export function useRentMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movieId: string) => {
      const response = await apiClient.post<Rental>("/rentals/me", { movieId });
      return response.data;
    },
    onSuccess: async () => {
      // A successful rental changes both the customer's history and the
      // available stock shown on the movie list.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-rentals"] }),
        queryClient.invalidateQueries({ queryKey: ["movies"] }),
      ]);
    },
  });
}
