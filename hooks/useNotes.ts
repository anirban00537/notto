import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getAllNotes, createNote } from "../lib/services/noteService";
import { CreateNoteDto, Note, NoteType } from "../lib/types/note";

// Define a potential API response structure
interface CreateNoteResponse {
  data?: Note; // Assuming the actual note data might be nested under 'data'
  id?: string; // Or the ID might be directly available
  noteType?: NoteType;
  // Add other potential top-level properties if needed
}

export const useNotes = (userId?: string, folderId: string = "all") => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // State for YouTube Modal
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Fetching Notes Query
  const {
    data: notes = [],
    isLoading: isNotesLoading,
    isError: isNotesError,
  } = useQuery<Note[]>({
    queryKey: ["notes", { userId, folderId }],
    queryFn: async () => {
      console.log(
        `Fetching notes for userId: ${userId}, folderId: ${folderId}`
      );
      // TODO: Update getAllNotes to accept folderId for filtering if needed
      const response = await getAllNotes();
      const allNotes: Note[] = response.data || [];
      // Filter client-side if backend doesn't support it yet
      if (folderId !== "all") {
        return allNotes.filter((note) => note.folderId === folderId);
      }
      return allNotes;
    },
    enabled: !!userId,
  });

  // Create Note Mutation
  const createNoteMutation = useMutation<
    CreateNoteResponse,
    Error,
    CreateNoteDto
  >({
    mutationFn: (newNoteData: CreateNoteDto) => createNote(newNoteData),
    onSuccess: (newNoteResponse: CreateNoteResponse) => {
      console.log("Note creation successful:", newNoteResponse);
      // Invalidate the notes query to refetch the list
      queryClient.invalidateQueries({
        queryKey: ["notes", { userId, folderId }],
      });

      // Extract note data and ID, handling potential nesting
      const noteData = newNoteResponse?.data;
      const noteId = noteData?.id || newNoteResponse?.id;

      // Reset YouTube modal state if it was a YouTube note
      const noteType = noteData?.noteType || newNoteResponse?.noteType;
      if (noteType === NoteType.YOUTUBE) {
        setYoutubeModalVisible(false);
        setYoutubeUrl("");
      }

      // Navigate to the new note's detail page
      if (noteId) {
        console.log(`Navigating to /note/${noteId}`);
        router.push(`/note/${noteId}`);
      } else {
        console.error(
          "Failed to get new note ID for navigation from response:",
          newNoteResponse
        );
      }
    },
    onError: (error: any) => {
      console.error("Error creating note:", error);
      alert(`Failed to create note: ${error.message || "Please try again."}`);
      // Ensure loading state is reset even on error
      const variables = (createNoteMutation.error?.cause as any)?.variables as
        | CreateNoteDto
        | undefined; // Access variables if needed
      if (variables?.noteType === NoteType.YOUTUBE) {
        setYoutubeModalVisible(false); // Consider keeping modal open or closing based on UX preference
        setYoutubeUrl(""); // Optionally clear URL
      }
    },
  });

  // Handlers for YouTube Modal
  const handleAddYouTube = () => {
    setYoutubeUrl(""); // Clear previous URL
    setYoutubeModalVisible(true);
  };

  const handleCloseYouTubeModal = () => {
    setYoutubeModalVisible(false);
    setYoutubeUrl("");
  };

  const handleSubmitYouTube = () => {
    if (
      !youtubeUrl ||
      !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(youtubeUrl)
    ) {
      alert("Please enter a valid YouTube URL.");
      return;
    }
    createNoteMutation.mutate({ noteType: NoteType.YOUTUBE, youtubeUrl });
  };

  return {
    notes,
    isNotesLoading,
    isNotesError,
    createNote: createNoteMutation.mutate,
    isCreatingNote: createNoteMutation.isPending,
    createNoteError: createNoteMutation.error,
    // YouTube Modal State & Handlers
    youtubeModalVisible,
    youtubeUrl,
    youtubeLoading:
      createNoteMutation.isPending &&
      (createNoteMutation.variables as CreateNoteDto)?.noteType ===
        NoteType.YOUTUBE, // Check pending mutation variables
    setYoutubeUrl,
    handleAddYouTube,
    handleCloseYouTubeModal,
    handleSubmitYouTube,
  };
};
