import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Movie } from "../types/Movie";

export function useMovies() {
  return useQuery<Movie[]>({
    queryKey: ["movies"],
    queryFn: () => apiClient.get("/movies").then((res) => res.data),
  });
}