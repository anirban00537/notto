import request from "./request";
import { AxiosError } from "axios";
import { Folder, CreateFolderDto } from "../types/folder";
import { ApiResponse } from "../types/response";

// API Services
export const getAllFolders = async (): Promise<ApiResponse<Folder[]>> => {
  const response = await request.get("/folders");
  return response.data;
};

export const getFolderById = async (
  id: string
): Promise<ApiResponse<Folder>> => {
  const response = await request.get(`/folders/${id}`);
  return response.data;
};

export const createFolder = async (
  newFolder: CreateFolderDto
): Promise<ApiResponse<Folder>> => {
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
): Promise<ApiResponse<Folder>> => {
  const response = await request.put(`/folders/${id}`, updateData);
  return response.data;
};

export const deleteFolder = async (id: string): Promise<ApiResponse<void>> => {
  const response = await request.delete(`/folders/${id}`);
  return response.data;
};
