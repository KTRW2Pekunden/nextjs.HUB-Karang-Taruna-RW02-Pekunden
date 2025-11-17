"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import {
  getSheetDataByColumn,
  addMeetingNote,
  deleteMeetingNote,
  updateMeetingNote,
} from "./lib/google-sheets-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

export interface MeetingNote {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  notulen: string;
  docURL: string;
}

interface ImageWithStatus {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function MeetingNotes() {
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<ImageWithStatus[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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

    fetchData();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setIsScrolled(target.scrollTop > 0);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    let folderURL = "";
    try {
      if (images.length > 0) {
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

      const newNote: MeetingNote = {
        id: editingId ?? (meetingNotes.length + 2).toString(),
        date: startDate,
        startTime,
        endTime,
        notulen: formattedNotulen,
        docURL: folderURL,
      };

      if (editingId) {
        const rowNumber = Number(editingId);
        await updateMeetingNote(rowNumber, {
          TANGGAL: newNote.date,
          "WAKTU MULAI": newNote.startTime,
          "WAKTU SELESAI": newNote.endTime,
          NOTULEN: newNote.notulen,
          "LINK DOKUMENTASI": newNote.docURL,
        });

        setMeetingNotes((prev) =>
          prev.map((note) => (note.id === editingId ? newNote : note))
        );
      } else {
        await addMeetingNote({
          TANGGAL: newNote.date,
          "WAKTU MULAI": newNote.startTime,
          "WAKTU SELESAI": newNote.endTime,
          NOTULEN: newNote.notulen,
          "LINK DOKUMENTASI": newNote.docURL,
        });
        setMeetingNotes([newNote, ...meetingNotes]);
      }

      setShowForm(false);
      setStartDate("");
      setStartTime("");
      setEndTime("");
      setNotes("");
      setImages([]);
      setErrors({});
      setEditingId(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal menyimpan notulen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, folderUrl: string) => {
    if (!confirm("Yakin ingin menghapus notulen ini?")) return;

    try {
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
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#1C1F24" }}>
      <div
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#1C1F24", borderColor: "#2a2e35" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-opacity-10 transition"
              style={{ backgroundColor: "rgba(231, 126, 79, 0.1)" }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: "#F5E9D6" }} />
            </Link>
            <div>
              <h1
                className="text-lg md:text-xl font-bold"
                style={{ color: "#F5E9D6" }}
              >
                Notulen Pertemuan
              </h1>
              <p className="text-xs md:text-sm" style={{ color: "#b8a88e" }}>
                Kelola dan lihat daftar semua notulen rapat
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base font-medium"
            style={{ backgroundColor: "#E77E4F", color: "#F5E9D6" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d86d3f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#E77E4F")
            }
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Tambah Notulen</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {showForm && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(28, 31, 36, 0.8)" }}
            onClick={() => setShowForm(false)}
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border rounded-2xl shadow-2xl p-6 relative animate-fadeIn"
              style={{ backgroundColor: "#1C1F24", borderColor: "#2a2e35" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3 p-2 rounded-full"
                style={{ color: "#F5E9D6" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2a2e35")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                ✕
              </button>

              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "#F5E9D6" }}
              >
                {editingId ? "Edit Notulen Rapat" : "Tambah Notulen Rapat"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm" style={{ color: "#F5E9D6" }}>
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{
                        backgroundColor: "#2a2e35",
                        borderColor: "#3a3e45",
                        color: "#F5E9D6",
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: "#F5E9D6" }}>
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{
                        backgroundColor: "#2a2e35",
                        borderColor: "#3a3e45",
                        color: "#F5E9D6",
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: "#F5E9D6" }}>
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{
                        backgroundColor: "#2a2e35",
                        borderColor: "#3a3e45",
                        color: "#F5E9D6",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm" style={{ color: "#F5E9D6" }}>
                    Isi Notulen
                  </label>
                  <textarea
                    rows={5}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: "#2a2e35",
                      borderColor: "#3a3e45",
                      color: "#F5E9D6",
                    }}
                  />
                </div>

                {!editingId && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "#F5E9D6" }}
                    >
                      Upload Gambar Dokumentasi (Opsional)
                    </label>
                    <label
                      className="flex items-center justify-center w-full px-3 py-6 border-2 border-dashed rounded-lg cursor-pointer transition"
                      style={{ borderColor: "#3a3e45" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#E77E4F";
                        e.currentTarget.style.backgroundColor = "#2a2e35";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#3a3e45";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon
                          className="w-5 h-5"
                          style={{ color: "#b8a88e" }}
                        />
                        <span className="text-xs" style={{ color: "#b8a88e" }}>
                          Klik untuk upload atau drag file
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {images.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {images.map((img, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={URL.createObjectURL(img.file)}
                              width={100}
                              height={100}
                              alt=""
                              className="w-full h-24 object-cover rounded-lg border"
                              style={{ borderColor: "#3a3e45" }}
                            />
                            <div
                              className="absolute inset-0 flex items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: "rgba(28, 31, 36, 0.6)",
                              }}
                            >
                              {img.status === "uploading" && (
                                <span
                                  className="text-xs"
                                  style={{ color: "#F5E9D6" }}
                                >
                                  Uploading...
                                </span>
                              )}
                              {img.status === "done" && (
                                <span
                                  className="text-xs"
                                  style={{ color: "#4ade80" }}
                                >
                                  Done
                                </span>
                              )}
                              {img.status === "error" && (
                                <span
                                  className="text-xs"
                                  style={{ color: "#ef4444" }}
                                >
                                  {img.error}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                              style={{ backgroundColor: "#dc2626" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#b91c1c")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#dc2626")
                              }
                            >
                              <Trash2
                                className="w-3 h-3"
                                style={{ color: "#F5E9D6" }}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 rounded-lg"
                  style={{ backgroundColor: "#E77E4F", color: "#F5E9D6" }}
                  onMouseEnter={(e) =>
                    !isLoading &&
                    (e.currentTarget.style.backgroundColor = "#d86d3f")
                  }
                  onMouseLeave={(e) =>
                    !isLoading &&
                    (e.currentTarget.style.backgroundColor = "#E77E4F")
                  }
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </form>
            </div>
          </div>
        )}

        <div
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: "#2a2e35" }}
        >
          <div
            className="max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-auto"
            onScroll={handleScroll}
          >
            <table className="w-full text-sm relative">
              <thead
                className={`sticky top-0 z-10 border-b transition-shadow duration-300 ${
                  isScrolled ? "shadow-lg" : ""
                }`}
                style={{
                  backgroundColor: "#1C1F24",
                  borderColor: "#2a2e35",
                  color: "#F5E9D6",
                }}
              >
                <tr>
                  <th
                    className="p-3 text-center min-w-[120px]"
                    style={{ backgroundColor: "#1C1F24" }}
                  >
                    Tanggal
                  </th>
                  <th
                    className="p-3 text-center min-w-[70px]"
                    style={{ backgroundColor: "#1C1F24" }}
                  >
                    Mulai
                  </th>
                  <th
                    className="p-3 text-center min-w-[70px]"
                    style={{ backgroundColor: "#1C1F24" }}
                  >
                    Selesai
                  </th>
                  <th
                    className="p-3 text-center min-w-[300px]"
                    style={{ backgroundColor: "#1C1F24" }}
                  >
                    Notulen
                  </th>
                  <th
                    className="p-3 text-center min-w-[100px]"
                    style={{ backgroundColor: "#1C1F24" }}
                  >
                    Dokumentasi
                  </th>
                  <th
                    className="p-3 text-center min-w-20"
                    style={{ backgroundColor: "#1C1F24" }}
                  >
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody
                className="divide-y"
                style={{ backgroundColor: "#1C1F24", borderColor: "#2a2e35" }}
              >
                {meetingNotes.map((note) => (
                  <tr
                    key={note.id}
                    className="transition-colors"
                    style={{ color: "#F5E9D6" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2a2e35")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="p-3 text-center align-top">
                      {formatDate(note.date)}
                    </td>
                    <td className="p-3 text-center align-top">
                      {note.startTime}
                    </td>
                    <td className="p-3 text-center align-top">
                      {note.endTime}
                    </td>
                    <td className="p-3 text-left align-top whitespace-pre-wrap">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {note.notulen}
                      </ReactMarkdown>
                    </td>
                    <td className="p-3 text-center align-top">
                      {note.docURL ? (
                        <a
                          href={note.docURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{ color: "#E77E4F" }}
                        >
                          Buka Folder
                        </a>
                      ) : (
                        <span style={{ color: "#b8a88e" }}>
                          Tidak ada dokumentasi
                        </span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex flex-row gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(note)}
                          className="p-2 rounded transition-colors"
                          style={{ color: "#F5E9D6" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#E77E4F")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                          title="Edit notulen"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id, note.docURL)}
                          className="p-2 rounded transition-colors"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#7f1d1d")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                          title="Hapus notulen"
                        >
                          <Trash2
                            className="w-4 h-4"
                            style={{ color: "#ef4444" }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
