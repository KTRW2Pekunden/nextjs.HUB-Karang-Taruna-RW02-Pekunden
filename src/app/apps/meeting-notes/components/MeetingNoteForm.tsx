"use client";

import React from "react";
import { ImageWithStatus } from "../types/meetingTypes";
import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";

interface MeetingNoteFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: string | null;
  startDate: string;
  setStartDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  images: ImageWithStatus[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  errors: Record<string, string>;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const MeetingNoteForm: React.FC<MeetingNoteFormProps> = ({
  showForm,
  setShowForm,
  editingId,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  notes,
  setNotes,
  images,
  handleImageUpload,
  handleRemoveImage,
  errors,
  isLoading,
  handleSubmit,
}) => {
  if (!showForm) return null;

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(28, 31, 36, 0.8)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border rounded-2xl shadow-2xl p-6 relative animate-fadeIn"
        style={{ backgroundColor: "#1C1F24", borderColor: "#2a2e35" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
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
              {errors.startDate && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                  {errors.startDate}
                </p>
              )}
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
              {errors.startTime && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                  {errors.startTime}
                </p>
              )}
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
              {errors.endTime && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                  {errors.endTime}
                </p>
              )}
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
            {errors.notes && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                {errors.notes}
              </p>
            )}
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
                          <span className="text-xs" style={{ color: "#F5E9D6" }}>
                            Uploading...
                          </span>
                        )}
                        {img.status === "done" && (
                          <span className="text-xs" style={{ color: "#4ade80" }}>
                            Done
                          </span>
                        )}
                        {img.status === "error" && (
                          <span className="text-xs" style={{ color: "#ef4444" }}>
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
                          (e.currentTarget.style.backgroundColor = "#b91c1c")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc2626")
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
              !isLoading && (e.currentTarget.style.backgroundColor = "#d86d3f")
            }
            onMouseLeave={(e) =>
              !isLoading && (e.currentTarget.style.backgroundColor = "#E77E4F")
            }
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
};