import { useState, useRef, useEffect } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  InfiniteData,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getAllNotes, createNote } from "../lib/services/noteService";
import { CreateNoteDto, Note, NoteType } from "../lib/types/note";
import { ApiResponse } from "../lib/types/response";
import { Alert } from "react-native";

// Define the API response structure
interface NotesApiResponse {
  notes: Note[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotes: number;
    limit: number;
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
      const pageParam = context.pageParam as number;
      const limit = 10;
      console.log(
        `Fetching notes page: ${pageParam}, limit: ${limit} for userId: ${userId}, folderId: ${folderId}`
      );
      const response = await getAllNotes({ page: pageParam, folderId, limit });
      if (!response.success) {
        throw new Error(response.message);
      }

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || !lastPage.data) return undefined;
      const pagination = lastPage.data.pagination;
      if (pagination.currentPage < pagination.totalPages) {
        return pagination.currentPage + 1;
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
  };
}
