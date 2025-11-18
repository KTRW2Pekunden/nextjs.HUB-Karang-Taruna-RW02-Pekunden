"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, AlertTriangle, Edit } from "lucide-react";
import {
  COLOR_BG_SECONDARY,
  COLOR_BORDER_DARK,
  COLOR_ERROR,
  COLOR_TEXT_PRIMARY,
  COLOR_ACCENT,
} from "../constants";

import {
  addProjectToSheet,
  updateProjectInSheet,
} from "../lib/project-sheets-service";
import { Project } from "../types";

interface Props {
  editingProject: Project | null; 
  onSaveProject: (project: Project, isEditing: boolean) => void;
  onClose: () => void;
}

export default function ProjectFormModal({
  editingProject,
  onSaveProject,
  onClose,
}: Props) {
  const [name, setName] = useState(editingProject?.name ?? "");
  const [description, setDescription] = useState(
    editingProject?.description ?? ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(editingProject?.name ?? "");
    setDescription(editingProject?.description ?? "");
    setError("");
  }, [editingProject]);

  const isEditing = !!editingProject;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !description) {
      setError("Nama dan Deskripsi wajib diisi.");
      return;
    }

    setLoading(true);

    const projectData: Project = {
      id: editingProject?.id ?? `proj-${Date.now()}`,
      name,
      description,
      timeline: editingProject?.timeline ?? [], 
    };

    try {
      if (isEditing) {
        await updateProjectInSheet(projectData); 
      } else {
        await addProjectToSheet(projectData); 
      }

      onSaveProject(projectData, isEditing);
      onClose();
    } catch (apiError) {
      console.error("Gagal menyimpan proyek ke Sheets:", apiError);
      setError("Gagal menyimpan proyek. Cek koneksi API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className={`p-3 rounded-lg mb-4 text-sm flex items-center border`}
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
        <label
          className="text-sm block mb-1"
          style={{ color: COLOR_TEXT_PRIMARY }}
        >
          Nama Proyek
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          style={{
            backgroundColor: COLOR_BG_SECONDARY,
            borderColor: COLOR_BORDER_DARK,
            color: COLOR_TEXT_PRIMARY,
          }}
          placeholder="Contoh: Proyek Desain Web V2"
          required
        />
      </div>
      <div>
        <label
          className="text-sm block mb-1"
          style={{ color: COLOR_TEXT_PRIMARY }}
        >
          Deskripsi Singkat
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          style={{
            backgroundColor: COLOR_BG_SECONDARY,
            borderColor: COLOR_BORDER_DARK,
            color: COLOR_TEXT_PRIMARY,
          }}
          placeholder="Jelaskan tujuan dan target utama proyek ini."
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full flex justify-center items-center px-4 py-2 rounded-lg shadow-md transition duration-200 disabled:opacity-50 font-medium text-sm"
        style={{ backgroundColor: COLOR_ACCENT, color: COLOR_TEXT_PRIMARY }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : isEditing ? (
          <Edit className="w-5 h-5 mr-2" />
        ) : (
          <Plus className="w-5 h-5 mr-2" />
        )}
        {loading
          ? "Memproses..."
          : isEditing
          ? "Simpan Perubahan"
          : "Buat Proyek"}
      </button>
    </form>
  );
}
