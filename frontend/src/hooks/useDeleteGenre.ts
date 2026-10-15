import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (genreId: string) => {
      const response = await apiClient.delete(`/genres/${genreId}`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["genres"] });
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
