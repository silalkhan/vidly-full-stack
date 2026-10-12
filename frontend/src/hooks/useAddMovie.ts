
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import type { Movie } from "../types/Movie";

interface NewMovie {
title: string;
genreId: string;
numberInStock: number;
dailyRentalRate: number;
}

export function useAddMovie() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: (movie: NewMovie) =>
apiClient.post<Movie>("/movies", movie).then((res) => res.data),


onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["movies"] });
},


});
}
