import { useEffect, useState } from "react";
import {
  getSheetDataByColumn,
  addMeetingNote,
  deleteMeetingNote,
  updateMeetingNote,
} from "../lib/google-sheets-service"; 
import { MeetingNote, ImageWithStatus, SheetRowData } from "../types/meetingTypes";

export const useMeetingNotes = () => {
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<ImageWithStatus[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const data: Record<string, string>[] = await getSheetDataByColumn();

      const mapped: MeetingNote[] = data.map((row, index) => ({
        id: (index + 2).toString(),
        date: row["TANGGAL"],
        startTime: row["WAKTU MULAI"],
        endTime: row["WAKTU SELESAI"],
        notulen: row["NOTULEN"],
        docURL: row["LINK DOKUMENTASI"],
      }));

      setMeetingNotes(mapped);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = "Tanggal wajib diisi";
    if (!startTime) newErrors.startTime = "Jam mulai wajib diisi";
    if (!endTime) newErrors.endTime = "Jam selesai wajib diisi";
    if (!notes.trim()) newErrors.notes = "Isi notulen wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: ImageWithStatus[] = Array.from(files).map((file) => ({
      file,
      status: "pending",
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (note: MeetingNote) => {
    setEditingId(note.id);
    setStartDate(note.date);
    setStartTime(note.startTime);
    setEndTime(note.endTime);
    setNotes(note.notulen);
    setImages([]);
    setShowForm(true);
  };

  const resetForm = () => {
    setStartDate("");
    setStartTime("");
    setEndTime("");
    setNotes("");
    setImages([]);
    setErrors({});
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    let folderURL = "";
    try {
      // 1. Upload Images
      if (images.length > 0 && !editingId) {
        setImages((prev) =>
          prev.map((img) => ({ ...img, status: "uploading" }))
        );

        const formData = new FormData();
        images.forEach((img) => formData.append("files", img.file));
        formData.append("date", startDate);

        const res = await fetch("/api/meeting-notes/gdrive-upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          setImages((prev) =>
            prev.map((img) => ({
              ...img,
              status: "error",
              error: data.error || "Upload gagal",
            }))
          );
          throw new Error(data.error || "Upload gagal");
        }

        folderURL = data.folderUrl;
        setImages((prev) => prev.map((img) => ({ ...img, status: "done" })));
      }

      const resAI = await fetch("/api/meeting-notes/ai-format", {
        method: "POST",
        body: JSON.stringify({ rawNote: notes }),
        headers: { "Content-Type": "application/json" },
      });
      const dataAI = await resAI.json();
      const formattedNotulen = dataAI.formattedNote ?? notes;
      
      if (editingId) {
        const existingNote = meetingNotes.find(n => n.id === editingId);
        folderURL = existingNote?.docURL ?? folderURL;
      }

      const newNote: MeetingNote = {
        id: editingId ?? (meetingNotes.length + 2).toString(),
        date: startDate,
        startTime,
        endTime,
        notulen: formattedNotulen,
        docURL: folderURL,
      };

      const sheetData: SheetRowData = {
        TANGGAL: newNote.date,
        "WAKTU MULAI": newNote.startTime,
        "WAKTU SELESAI": newNote.endTime,
        NOTULEN: newNote.notulen,
        "LINK DOKUMENTASI": newNote.docURL,
      };


      if (editingId) {
        const rowNumber = Number(editingId);
        await updateMeetingNote(rowNumber, sheetData);

        setMeetingNotes((prev) =>
          prev.map((note) => (note.id === editingId ? newNote : note))
        );
      } else {
        await addMeetingNote(sheetData);
        setMeetingNotes([newNote, ...meetingNotes]);
      }

      setShowForm(false);
      resetForm();

    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal menyimpan notulen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, folderUrl: string) => {
    if (!confirm("Yakin ingin menghapus notulen ini?")) return;

    try {
      setIsLoading(true);

      if (folderUrl) {
        const res = await fetch("/api/meeting-notes/gdrive-delete", {
          method: "POST",
          body: JSON.stringify({ folderUrl }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!data.success) console.warn("Gagal hapus folder:", data.message);
      }

      await deleteMeetingNote(Number(id));
      setMeetingNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus notulen");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    meetingNotes,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    notes,
    setNotes,
    images,
    setImages,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    handleScroll: () => {}, 
    handleImageUpload,
    handleRemoveImage,
    handleEdit,
    handleSubmit,
    handleDelete,
    resetForm,
  };
};