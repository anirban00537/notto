import { useQuery } from "@tanstack/react-query";
import { getAllNotes } from "../lib/services/noteService";

export const useNotes = (userId?: string, folderId?: string) => {
  return useQuery({
    queryKey: ["notes", { userId, folderId }],
    queryFn: async () => {
      const response = await getAllNotes();
      return response.data || [];
    },
    enabled: !!userId,
  });
};
