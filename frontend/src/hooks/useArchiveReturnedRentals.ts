import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/apiClient";

interface ArchivePreviewResponse {
  count: number;
  eligibleIds: string[];
}

interface SelectedArchivePreviewResponse {
  requestedCount: number;
  eligibleCount: number;
  eligibleIds: string[];
  skippedCount: number;
}

interface ArchiveResponse {
  archivedCount: number;
  skippedCount: number;
}

export function useArchiveReturnedRentals() {
  const queryClient = useQueryClient();

  const previewQuery = useQuery<ArchivePreviewResponse>({
    queryKey: ["rentals-archive-preview"],
    queryFn: async () => {
      // The server calculates eligibility; the browser never decides which
      // records are safe to archive.
      const response = await apiClient.get<ArchivePreviewResponse>(
        "/rentals/archive-preview",
      );
      return response.data;
    },
    staleTime: 0,
  });

  const selectedPreviewMutation = useMutation({
    mutationFn: async (rentalIds: string[]) => {
      const response = await apiClient.post<SelectedArchivePreviewResponse>(
        "/rentals/archive/preview",
        { rentalIds },
      );
      return response.data;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (rentalIds: string[]) => {
      const response = await apiClient.post<ArchiveResponse>("/rentals/archive", {
        rentalIds,
      });
      return response.data;
    },
    onSuccess: async () => {
      // Refresh both the current list and the server's eligibility count after
      // archiving, including when the admin is viewing the archived filter.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rentals"] }),
        queryClient.invalidateQueries({ queryKey: ["rentals-archive-preview"] }),
      ]);
    },
  });

  return {
    previewQuery,
    selectedPreviewMutation,
    archiveMutation,
  };
}
