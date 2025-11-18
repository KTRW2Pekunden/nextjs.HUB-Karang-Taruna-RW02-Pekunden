"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Loader2, AlertTriangle } from "lucide-react";
import { Milestone, Project } from "../types";
import {
  COLOR_ACCENT,
  COLOR_BG_SECONDARY,
  COLOR_BORDER_DARK,
  COLOR_ERROR,
  COLOR_TEXT_PRIMARY,
} from "../constants";

import { saveMilestoneToSheet } from "../lib/project-sheets-service"; 

interface Props {
  project: Project;
  editingMilestone: Milestone | null;
  onSaveMilestone: (
    projectId: string,
    milestone: Milestone,
    isEditing: boolean
  ) => void;
  onClose: () => void;
}

export default function MilestoneFormModal({
  project,
  editingMilestone,
  onSaveMilestone,
  onClose,
}: Props) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [title, setTitle] = useState(editingMilestone?.title ?? "");
  const [start, setStart] = useState(editingMilestone?.start ?? today);
  const [end, setEnd] = useState(editingMilestone?.end ?? today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingMilestone) {
      setTitle(editingMilestone.title);
      setStart(editingMilestone.start);
      setEnd(editingMilestone.end);
    } else {
      setTitle("");
      setStart(today);
      setEnd(today);
    }
    setError("");
  }, [editingMilestone, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !start || !end) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (new Date(start) > new Date(end)) {
      setError("Tanggal Mulai tidak boleh setelah Tanggal Akhir.");
      return;
    }

    setLoading(true);

    const dateLabel = start === end
      ? new Date(start).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      : `${new Date(start).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${new Date(end).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;

    const milestone: Milestone = {
      id: editingMilestone?.id ?? `m-${Date.now()}`, 
      dateLabel,
      start,
      end,
      title,
      status: editingMilestone?.status ?? "upcoming",
    };

    try {
        await saveMilestoneToSheet(milestone, project.id, !!editingMilestone); // Panggilan API
        
        onSaveMilestone(project.id, milestone, !!editingMilestone);
        onClose();
    } catch (apiError) {
        console.error("Gagal menyimpan milestone ke Sheets:", apiError);
        setError("Gagal menyimpan milestone. Cek koneksi API.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="p-3 rounded-lg text-sm flex items-center border"
          style={{
            backgroundColor: COLOR_ERROR + "10",
            color: COLOR_ERROR,
            borderColor: COLOR_ERROR,
          }}
        >
          <AlertTriangle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      <div>
        <label className="text-sm block mb-1" style={{ color: COLOR_TEXT_PRIMARY }}>
          Judul Kegiatan
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          style={{
            backgroundColor: COLOR_BG_SECONDARY,
            borderColor: COLOR_BORDER_DARK,
            color: COLOR_TEXT_PRIMARY,
          }}
          placeholder="Contoh: Mulai Open PO"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm block mb-1" style={{ color: COLOR_TEXT_PRIMARY }}>
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
            style={{
              backgroundColor: COLOR_BG_SECONDARY,
              borderColor: COLOR_BORDER_DARK,
              color: COLOR_TEXT_PRIMARY,
            }}
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1" style={{ color: COLOR_TEXT_PRIMARY }}>
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            min={start || today}
            className="w-full p-2 border rounded-lg text-sm"
            style={{
              backgroundColor: COLOR_BG_SECONDARY,
              borderColor: COLOR_BORDER_DARK,
              color: COLOR_TEXT_PRIMARY,
            }}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full flex justify-center items-center px-4 py-2 rounded-lg shadow-md transition duration-200 disabled:opacity-50 font-medium text-sm"
        style={{ backgroundColor: COLOR_ACCENT, color: COLOR_TEXT_PRIMARY }}
      >
        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : editingMilestone ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
        {loading ? "Menyimpan..." : editingMilestone ? "Simpan Perubahan" : "Tambah Milestone"}
      </button>
    </form>
  );
}