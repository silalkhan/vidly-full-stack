import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Genre } from "../types/Movie";

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: () => apiClient.get("/genres").then((res) => res.data),
  });
}