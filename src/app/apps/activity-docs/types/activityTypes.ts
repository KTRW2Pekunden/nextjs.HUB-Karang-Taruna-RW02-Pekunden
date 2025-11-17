export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  createdAt: Date;
  size?: number;
  parentId?: string;
}

export interface DriveResponseItem {
  id: string;
  name: string;
  type: "folder" | "file";
  createdAt: string; 
  size?: number;
  parentId?: string;
}