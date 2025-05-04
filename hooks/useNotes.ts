import { useState, useRef, useEffect } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  InfiniteData,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  getAllNotes,
  createNote,
  deleteNote,
  generateLearningMaterials,
} from "../lib/services/noteService";
import { CreateNoteDto, Note, NoteType } from "../lib/types/note";
import { ApiResponse } from "../lib/types/response";
import { Alert } from "react-native";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// Define the API response structure
interface NotesApiResponse {
  notes: Note[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotes: number;
    limit: number;
    lastVisible?: FirebaseFirestoreTypes.QueryDocumentSnapshot;
  };
}

export function useNotes(userId: string | undefined, folderId: string) {
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeSuccess, setYoutubeSuccess] = useState(false);
  const youtubeBottomSheetRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Effect to handle folder changes
  useEffect(() => {
    // Reset infinite query data when folder changes
    queryClient.resetQueries({
      queryKey: ["notes", { userId, folderId }],
    });
  }, [folderId, userId]);

  // Fetching Notes Query using useInfiniteQuery
  const {
    data,
    isLoading: isNotesLoading,
    isError: isNotesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<ApiResponse<NotesApiResponse>, Error>({
    queryKey: ["notes", { userId, folderId }],
    queryFn: async (context) => {
      if (!userId) throw new Error("User ID is required");
      const pageParam = context.pageParam as number;
      const limit = 10;

      // Get the last document from the previous page
      const lastPage = context.pageParam
        ? (context.queryKey[1] as any).lastVisible
        : undefined;

      return getAllNotes({
        page: pageParam,
        folderId,
        limit,
        userId,
        lastVisible: lastPage,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || !lastPage.data) return undefined;
      const pagination = lastPage.data.pagination;
      if (pagination.currentPage < pagination.totalPages) {
        return {
          page: pagination.currentPage + 1,
          lastVisible: pagination.lastVisible,
        };
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    structuralSharing: false,
  });

  // Flatten the pages data into a single array of notes
  const notes =
    data?.pages.flatMap((page) =>
      page.success && page.data ? page.data.notes : []
    ) ?? [];

  // Remove any duplicate notes based on ID
  const uniqueNotes = notes.filter(
    (note, index, self) => index === self.findIndex((n) => n.id === note.id)
  );

  // Create Note Mutation
  const createNoteMutation = useMutation<
    ApiResponse<Note>,
    Error,
    CreateNoteDto
  >({
    mutationFn: createNote,
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.message);
      }

      console.log("Note creation successful:", response);

      // Reset and refetch notes when a new note is created
      queryClient.resetQueries({
        queryKey: ["notes", { userId, folderId }],
      });
      refetch();

      const noteData = response.data;
      if (!noteData) {
        throw new Error("No note data in response");
      }

      if (noteData.noteType === NoteType.YOUTUBE) {
        setYoutubeSuccess(true);
        setTimeout(() => {
          setYoutubeSuccess(false);
          setYoutubeLoading(false);
          setYoutubeModalVisible(false);
          setYoutubeUrl("");
          router.push(`/note/${noteData.id}`);
        }, 1500);
      } else if (noteData.id) {
        // For PDF/Audio, navigate after success is shown
      } else {
        console.error(
          "Failed to get new note ID for navigation from response:",
          response
        );
      }
    },
    onError: (error: any) => {
      console.error("Error creating note:", error);
      Alert.alert("Error", error.message || "Failed to create note");
      const variables = (error?.cause as any)?.variables as
        | CreateNoteDto
        | undefined;
      if (variables?.noteType === NoteType.YOUTUBE) {
        setYoutubeLoading(false);
        setYoutubeSuccess(false);
      }
    },
  });

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.message);
      }

      console.log("Note deletion successful");

      // Reset and refetch notes when a note is deleted
      queryClient.resetQueries({
        queryKey: ["notes", { userId, folderId }],
      });
      refetch();
    },
    onError: (error: any) => {
      console.error("Error deleting note:", error);
      Alert.alert("Error", error.message || "Failed to delete note");
    },
  });

  // Generate Materials Mutation
  const generateMaterialsMutation = useMutation({
    mutationFn: generateLearningMaterials,
    onSuccess: async (response, noteId) => {
      if (!response.success) {
        throw new Error(response.message);
      }
      // Invalidate and refetch the specific note query
      await queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      // Also invalidate the notes list to update any cached data
      await queryClient.invalidateQueries({
        queryKey: ["notes", { userId, folderId }],
      });
      console.log("Materials generated and note refetched");
    },
    onError: (error: any) => {
      console.error("Error generating materials:", error);
      Alert.alert("Error", error.message || "Failed to generate materials");
    },
  });

  const handleGenerateMaterials = async (noteId: string) => {
    try {
      await generateMaterialsMutation.mutateAsync(noteId);
    } catch (error) {
      // Error is handled in onError callback
      console.error("Failed to generate materials:", error);
    }
  };

  // Handlers for YouTube Modal
  const handleAddYouTube = () => {
    setYoutubeUrl("");
    setYoutubeModalVisible(true);
  };

  const handleCloseYouTubeModal = () => {
    setYoutubeModalVisible(false);
    setYoutubeUrl("");
  };

  const handleSubmitYouTube = async () => {
    if (!youtubeUrl) return;
    setYoutubeLoading(true);
    setYoutubeSuccess(false);
    try {
      const noteDto: CreateNoteDto = {
        noteType: NoteType.YOUTUBE,
        youtubeUrl: youtubeUrl,
        folderId: folderId !== "all" ? folderId : undefined,
      };
      createNoteMutation.mutate(noteDto);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit YouTube note");
      setYoutubeLoading(false);
    }
  };

  // Helper function to create note with folder ID
  const createNoteWithFolder = (noteDto: Partial<CreateNoteDto>) => {
    const completeNoteDto: CreateNoteDto = {
      ...noteDto,
      folderId: folderId !== "all" ? folderId : undefined,
    } as CreateNoteDto;
    createNoteMutation.mutate(completeNoteDto);
  };

  // Handler for deleting a note
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
    } catch (error) {
      // Error is handled in onError callback
      console.error("Failed to delete note:", error);
    }
  };

  return {
    notes: uniqueNotes,
    isNotesLoading,
    isError: isNotesError,
    youtubeModalVisible,
    youtubeUrl,
    youtubeLoading,
    youtubeSuccess,
    setYoutubeUrl,
    handleAddYouTube,
    handleCloseYouTubeModal,
    handleSubmitYouTube,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchNotes: refetch,
    createNoteWithFolder,
    handleDeleteNote,
    isDeletingNote: deleteNoteMutation.isPending,
    handleGenerateMaterials,
    isGeneratingMaterials: generateMaterialsMutation.isPending,
  };
}
