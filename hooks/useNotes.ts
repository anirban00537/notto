import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getAllNotes, createNote } from "../lib/services/noteService";
import { CreateNoteDto, Note, NoteType } from "../lib/types/note";
import { Alert } from "react-native";

// Define a potential API response structure
interface CreateNoteResponse {
  data?: Note; // Assuming the actual note data might be nested under 'data'
  id?: string; // Or the ID might be directly available
  noteType?: NoteType;
  // Add other potential top-level properties if needed
}

export function useNotes(userId: string | undefined, folderId: string) {
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeSuccess, setYoutubeSuccess] = useState(false);
  const youtubeBottomSheetRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

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
      Alert.alert("Error", error.message || "Failed to create note");
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

  const handleSubmitYouTube = async () => {
    if (!youtubeUrl) return;

    setYoutubeLoading(true);
    try {
      const noteDto: CreateNoteDto = {
        noteType: NoteType.YOUTUBE,
        youtubeUrl: youtubeUrl,
      };

      const response = await createNote(noteDto);
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      const noteId = response?.data?.id || response?.id;
      if (noteId) {
        setYoutubeSuccess(true);
        setTimeout(() => {
          setYoutubeSuccess(false);
          setYoutubeLoading(false);
          setYoutubeModalVisible(false);
          setYoutubeUrl("");
          router.push(`/note/${noteId}`);
        }, 1500);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create note");
      setYoutubeLoading(false);
    }
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
    youtubeLoading,
    youtubeSuccess,
    setYoutubeUrl,
    handleAddYouTube,
    handleCloseYouTubeModal,
    handleSubmitYouTube,
    refetchNotes: () =>
      queryClient.refetchQueries({
        queryKey: ["notes", { userId, folderId }],
      }),
  };
}
