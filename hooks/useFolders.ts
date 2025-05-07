import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllFolders, createFolder } from "../lib/services/folderService";
import { useState } from "react";
import { Keyboard } from "react-native";
import { ApiResponse } from "../lib/types/response";
import { Folder } from "../lib/types/folder";
import { useUser } from "../app/context/UserContext";

export const useFolders = () => {
  const { user } = useUser();
  const [newFolderName, setNewFolderName] = useState<string>("");
  const queryClient = useQueryClient();
  const userId = user?.uid ?? "";

  const { data: foldersResponse, refetch: refetchFolders } = useQuery<
    ApiResponse<Folder[]>
  >({
    queryKey: ["folders", userId],
    queryFn: () => getAllFolders(userId),
    enabled: !!userId,
  });

  const folders = foldersResponse?.data || [];

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: (response: ApiResponse<Folder>) => {
      if (!response.success) {
        throw new Error(response.message);
      }
      queryClient.invalidateQueries({ queryKey: ["folders", userId] });
      refetchFolders();
    },
  });

  const handleCreateFolder = async () => {
    if (!userId || newFolderName.trim() === "") return;

    try {
      const response = await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
        userId,
      });

      if (response.success) {
        setNewFolderName("");
        Keyboard.dismiss();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating folder:", error);
      return false;
    }
  };

  return {
    folders,
    newFolderName,
    setNewFolderName,
    handleCreateFolder,
    refetchFolders,
    isCreatingFolder: createFolderMutation.isPending,
  };
};
