import request from "./request";
import { AxiosError } from "axios";

// Types
export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateFolderDto {
  name: string;
  userId: string;
}

// API Services
export const getAllFolders = async () => {
  const response = await request.get("/folders");
  return response.data;
};

export const getFolderById = async (id: string) => {
  const response = await request.get(`/folders/${id}`);
  return response.data;
};

export const createFolder = async (newFolder: CreateFolderDto) => {
  try {
    console.log("Creating folder with data:", newFolder);
    console.log("Request URL:", request.defaults.baseURL + "/folders");
    const response = await request.post("/folders", newFolder);
    return response.data;
  } catch (error) {
    console.error("Full Axios Error:", error);
    throw error;
  }
};

export const updateFolder = async (
  id: string,
  updateData: Partial<CreateFolderDto>
) => {
  const response = await request.put(`/folders/${id}`, updateData);
  return response.data;
};

export const deleteFolder = async (id: string) => {
  await request.delete(`/folders/${id}`);
};
