export enum FolderStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  description?: string;
  status?: FolderStatus;
  parentId?: string;
  metadata?: Record<string, any>;
  isPublic?: boolean;
  collaborators?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  version?: number;
  lastEditedBy?: string;
}

export interface CreateFolderDto {
  name: string;
  userId: string;
  description?: string;
  parentId?: string;
  isPublic?: boolean;
}

export interface UpdateFolderDto {
  name?: string;
  description?: string;
  status?: FolderStatus;
  isPublic?: boolean;
  collaborators?: string[];
}

export interface FolderResponse extends Folder {
  notesCount?: number;
  subFoldersCount?: number;
  parent?: Folder;
}