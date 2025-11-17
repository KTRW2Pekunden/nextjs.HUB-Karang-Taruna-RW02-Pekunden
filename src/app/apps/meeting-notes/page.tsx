"use client";

import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { useMeetingNotes } from "./hooks/useMeetingNotes";
import { MeetingNoteForm } from "./components/MeetingNoteForm";
import { MeetingNoteList } from "./components/MeetingNoteList";

export default function MeetingNotes() {
  const {
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
    errors,
    isLoading,
    handleImageUpload,
    handleRemoveImage,
    handleEdit,
    handleSubmit,
    handleDelete,
    resetForm,
  } = useMeetingNotes();

  const handleOpenForm = () => {
    resetForm();
    setEditingId(null);
    setShowForm(true);
  };

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
            onClick={handleOpenForm}
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
        <MeetingNoteForm
          showForm={showForm}
          setShowForm={setShowForm}
          editingId={editingId}
          startDate={startDate}
          setStartDate={setStartDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          notes={notes}
          setNotes={setNotes}
          images={images}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
          errors={errors}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
        />

        <MeetingNoteList
          meetingNotes={meetingNotes}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </main>
  );
}
