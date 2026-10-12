import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Movie } from "../types/Movie";

export interface UpdateMovieData {
  title: string;
  genreId: string;
  numberInStock: number;
  dailyRentalRate: number;
}

interface UpdateMovieVariables extends UpdateMovieData {
  id: string;
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...movie }: UpdateMovieVariables) => {
      const response = await apiClient.put<Movie>(`/movies/${id}`, movie);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
