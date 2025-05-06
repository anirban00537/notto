import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Folder, CreateFolderDto } from "../types/folder";
import { ApiResponse } from "../types/response";

// Simple UUID generator for React Native that doesn't use crypto
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getFolderCollection = (userId: string) => {
  return firestore().collection("users").doc(userId).collection("folders");
};

export const getAllFolders = async (
  userId: string
): Promise<ApiResponse<Folder[]>> => {
  try {
    const snapshot = await getFolderCollection(userId).get();
    const folders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Folder[];

    return {
      success: true,
      message: "Folders retrieved successfully",
      data: folders,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to retrieve folders",
      error: error.message,
    };
  }
};

export const getFolderById = async (
  id: string,
  userId: string
): Promise<ApiResponse<Folder>> => {
  try {
    const doc = await getFolderCollection(userId).doc(id).get();

    if (!doc.exists) {
      return {
        success: false,
        message: "Folder not found",
      };
    }

    return {
      success: true,
      message: "Folder retrieved successfully",
      data: { id: doc.id, ...doc.data() } as Folder,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to retrieve folder",
      error: error.message,
    };
  }
};

export const createFolder = async (
  newFolder: CreateFolderDto
): Promise<ApiResponse<Folder>> => {
  try {
    const { name, userId } = newFolder;
    // Replace uuidv4() with our custom implementation
    const folderId = generateUUID();
    const now = new Date();

    const folderData: Folder = {
      id: folderId,
      name,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    await getFolderCollection(userId).doc(folderId).set(folderData);

    return {
      success: true,
      message: "Folder created successfully",
      data: folderData,
    };
  } catch (error: any) {
    console.error("Error creating folder:", error);
    return {
      success: false,
      message: "Failed to create folder",
      error: error.message,
    };
  }
};

export const updateFolder = async (
  id: string,
  userId: string,
  updateData: Partial<CreateFolderDto>
): Promise<ApiResponse<Folder>> => {
  try {
    const folderRef = getFolderCollection(userId).doc(id);
    const doc = await folderRef.get();

    if (!doc.exists) {
      return {
        success: false,
        message: "Folder not found",
      };
    }

    const updatePayload = {
      ...updateData,
      updatedAt: new Date(),
    };

    await folderRef.update(updatePayload);

    const updatedDoc = await folderRef.get();
    return {
      success: true,
      message: "Folder updated successfully",
      data: { id: updatedDoc.id, ...updatedDoc.data() } as Folder,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to update folder",
      error: error.message,
    };
  }
};

export const deleteFolder = async (
  id: string,
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    const folderRef = getFolderCollection(userId).doc(id);
    const doc = await folderRef.get();

    if (!doc.exists) {
      return {
        success: false,
        message: "Folder not found",
      };
    }

    await folderRef.delete();

    return {
      success: true,
      message: "Folder deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to delete folder",
      error: error.message,
    };
  }
};
