import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";

export function useDeleteMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: string) => apiClient.delete(`/movies/${movieId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
