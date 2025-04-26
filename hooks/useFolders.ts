import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllFolders, createFolder } from "../lib/services/folderService";
import { useState } from "react";
import { Keyboard } from "react-native";

export const useFolders = () => {
  const [newFolderName, setNewFolderName] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: foldersResponse, refetch: refetchFolders } = useQuery({
    queryKey: ["folders"],
    queryFn: getAllFolders,
  });

  const folders = foldersResponse?.data || [];

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      refetchFolders();
    },
  });

  const handleCreateFolder = async (userId: string) => {
    if (!userId || newFolderName.trim() === "") return;

    try {
      await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
        userId,
      });
      setNewFolderName("");
      Keyboard.dismiss();
      return true;
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
