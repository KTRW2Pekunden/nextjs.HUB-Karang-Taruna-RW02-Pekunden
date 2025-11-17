export interface MeetingNote {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  notulen: string;
  docURL: string;
}

export interface ImageWithStatus {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export interface SheetRowData {
  TANGGAL: string;
  "WAKTU MULAI": string;
  "WAKTU SELESAI": string;
  NOTULEN: string;
  "LINK DOKUMENTASI": string;
}