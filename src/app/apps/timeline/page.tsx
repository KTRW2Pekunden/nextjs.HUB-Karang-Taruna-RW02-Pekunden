"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, ChevronLeft, ArrowRight } from "lucide-react";

import Modal from "./components/Modal";
import TimelineItem from "./components/TimelineItem";
import MilestoneFormModal from "./components/MilestoneFormModal";
import ProjectFormModal from "./components/ProjectFormModal";
import ProjectDashboard from "./components/ProjectDashboard";
import ProjectSummaryCard from "./components/projectSummary";

import {
  getProjectsFromSheet,
  deleteMilestone,
  updateMilestoneStatus,
  deleteProjectFromSheet,
} from "./lib/project-sheets-service";

import { Project, Milestone } from "./types";

import {
  MAX_WIDTH_CLASS,
  COLOR_BG_DARK,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_ACCENT,
  COLOR_BORDER_DARK,
  COLOR_BG_SECONDARY,
  COLOR_PRIMARY,
} from "./constants";

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [currentEditingProject, setCurrentEditingProject] =
    useState<Project | null>(null);

  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [currentEditingMilestone, setCurrentEditingMilestone] =
    useState<Milestone | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoadingInitial(true);
      const data = await getProjectsFromSheet();
      setProjects(data);
    } catch (error) {
      console.error("Gagal memuat proyek:", error);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const sortedTimeline = useMemo(() => {
    if (!selectedProject) return [];
    return [...selectedProject.timeline].sort((a, b) => {
      const diffStart =
        new Date(a.start).getTime() - new Date(b.start).getTime();
      if (diffStart !== 0) return diffStart;
      return new Date(a.end).getTime() - new Date(b.end).getTime();
    });
  }, [selectedProject]);

  const handleOpenAddProject = useCallback(() => {
    setCurrentEditingProject(null);
    setShowProjectForm(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setCurrentEditingProject(project);
    setShowProjectForm(true);
  }, []);

  const handleCloseProjectModal = useCallback(() => {
    setShowProjectForm(false);
    setCurrentEditingProject(null);
  }, []);

  const handleSaveProject = useCallback(async () => {
    await loadProjects();
    handleCloseProjectModal();
  }, [handleCloseProjectModal, loadProjects]);

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (
        !window.confirm(
          "PERINGATAN! Anda yakin ingin menghapus proyek ini dan data milestonenya?"
        )
      )
        return;

      try {
        await deleteProjectFromSheet(projectId);
        await loadProjects();

        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
      } catch (error) {
        console.error("Gagal menghapus proyek:", error);
        alert("Gagal menghapus proyek dari Google Sheets.");
      }
    },
    [selectedProjectId, loadProjects]
  );

  const handleSaveMilestone = useCallback(async () => {
    await loadProjects();
    setMilestoneModalOpen(false);
    setCurrentEditingMilestone(null);
  }, [loadProjects]);

  const handleDeleteMilestone = useCallback(
    async (milestoneId: string) => {
      if (!window.confirm("Apakah Anda yakin ingin menghapus milestone ini?"))
        return;

      try {
        await deleteMilestone(milestoneId);
        await loadProjects();
      } catch (error) {
        console.error("Gagal menghapus milestone:", error);
        alert("Gagal menghapus milestone dari Google Sheets.");
      }
    },
    [loadProjects]
  );

  const handleUpdateMilestoneStatus = useCallback(
    async (milestoneId: string, newStatus: "completed" | "upcoming") => {
      try {
        await updateMilestoneStatus(milestoneId, newStatus);
        await loadProjects();
      } catch (error) {
        console.error("Gagal mengupdate status milestone:", error);
        alert("Gagal mengupdate status di Google Sheets.");
      }
    },
    [loadProjects]
  );

  const handleOpenAddMilestone = useCallback(() => {
    setCurrentEditingMilestone(null);
    setMilestoneModalOpen(true);
  }, []);

  const handleEditMilestone = useCallback((milestone: Milestone) => {
    setCurrentEditingMilestone(milestone);
    setMilestoneModalOpen(true);
  }, []);

  const handleCloseMilestoneModal = useCallback(() => {
    setMilestoneModalOpen(false);
    setCurrentEditingMilestone(null);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedProjectId(null);
    setShowProjectForm(false);
    setMilestoneModalOpen(false);
    setCurrentEditingMilestone(null);
  }, []);

  const handleBackToRoot = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const isTimelineView = !!selectedProjectId && !!selectedProject;

  return (
    <>
      <style jsx global>{`
        .font-sans {
          font-family: "Inter", sans-serif;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.7;
        }
      `}</style>

      <div
        className="min-h-screen font-sans"
        style={{ backgroundColor: COLOR_BG_DARK, color: COLOR_TEXT_PRIMARY }}
      >
        <Modal
          isOpen={showProjectForm}
          onClose={handleCloseProjectModal}
          title={currentEditingProject ? "Edit Proyek" : "Buat Proyek Baru"}
        >
          <ProjectFormModal
            editingProject={currentEditingProject}
            onSaveProject={handleSaveProject}
            onClose={handleCloseProjectModal}
          />
        </Modal>

        <Modal
          isOpen={milestoneModalOpen && !!selectedProject}
          onClose={handleCloseMilestoneModal}
          title={
            currentEditingMilestone ? "Edit Milestone" : "Tambah Milestone Baru"
          }
        >
          {selectedProject && (
            <MilestoneFormModal
              project={selectedProject}
              editingMilestone={currentEditingMilestone}
              onSaveMilestone={handleSaveMilestone}
              onClose={handleCloseMilestoneModal}
            />
          )}
        </Modal>

        <div
          className="sticky top-0 z-40 border-b"
          style={{
            backgroundColor: COLOR_BG_DARK,
            borderColor: COLOR_BORDER_DARK,
          }}
        >
          <div
            className={`${MAX_WIDTH_CLASS} py-4 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={
                  isTimelineView ? handleBackToDashboard : handleBackToRoot
                }
                className={`p-2 rounded-lg hover:bg-opacity-10 transition shrink-0 ${
                  !isTimelineView ? "opacity-70" : ""
                }`}
                style={{
                  backgroundColor: `${COLOR_ACCENT}1A`,
                  color: COLOR_TEXT_PRIMARY,
                }}
                title={
                  isTimelineView
                    ? "Kembali ke Dashboard Proyek"
                    : "Refresh Halaman Utama"
                }
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="overflow-hidden">
                <h1
                  className="text-lg md:text-xl font-bold truncate"
                  style={{ color: COLOR_TEXT_PRIMARY }}
                >
                  {isTimelineView ? selectedProject!.name : "Manajemen Proyek"}
                </h1>
                <p
                  className="text-xs md:text-sm truncate"
                  style={{ color: COLOR_TEXT_SECONDARY }}
                >
                  {isTimelineView
                    ? selectedProject!.description
                    : "Kelola semua Timeline Karang Taruna RW 02"}
                </p>
              </div>
            </div>

            <button
              onClick={
                isTimelineView ? handleOpenAddMilestone : handleOpenAddProject
              }
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition text-sm md:text-base font-medium shrink-0"
              style={{
                backgroundColor: COLOR_ACCENT,
                color: COLOR_TEXT_PRIMARY,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = COLOR_PRIMARY)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = COLOR_ACCENT)
              }
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">
                {isTimelineView ? "Tambah Milestone" : "Tambah Proyek"}
              </span>
              <span className="sm:hidden">
                {isTimelineView ? "Milestone" : "Proyek"}
              </span>
            </button>
          </div>
        </div>

        <div className={`${MAX_WIDTH_CLASS} py-6`}>
          {loadingInitial ? (
            <div className="flex flex-col items-center justify-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
                style={{ borderColor: "#E77E4F" }}
              ></div>
              <p className="text-sm" style={{ color: "#b8a88e" }}>
                Memuat proyek...
              </p>
            </div>
          ) : !selectedProjectId || !selectedProject ? (
            <ProjectDashboard
              projects={projects}
              onSelectProject={setSelectedProjectId}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          ) : (
            <>
              <ProjectSummaryCard project={selectedProject} />

              <h2
                className="text-xl font-semibold mb-6"
                style={{ color: COLOR_ACCENT }}
              >
                Daftar Aktivitas ({sortedTimeline.length})
              </h2>

              <div className="relative">
                {sortedTimeline.length > 0 ? (
                  sortedTimeline.map((item) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      onDelete={handleDeleteMilestone}
                      onEdit={handleEditMilestone}
                      onUpdateStatus={handleUpdateMilestoneStatus}
                    />
                  ))
                ) : (
                  <div
                    className="text-center p-8 rounded-lg border border-dashed"
                    style={{
                      backgroundColor: COLOR_BG_SECONDARY,
                      borderColor: COLOR_BORDER_DARK,
                      color: COLOR_TEXT_SECONDARY,
                    }}
                  >
                    Tidak ada milestone di proyek ini. Silakan tambahkan satu!
                  </div>
                )}

                <div className="flex relative pl-8 pt-4">
                  <div
                    className="absolute w-4 h-4 rounded-full flex items-center justify-center p-1"
                    style={{
                      backgroundColor: COLOR_ACCENT,
                      bottom: "0px",
                      left: "8px",
                    }}
                  >
                    <ArrowRight
                      className="w-4 h-4"
                      style={{ color: COLOR_BG_DARK }}
                    />
                  </div>
                  <p
                    className="ml-4 text-sm font-semibold"
                    style={{ color: COLOR_TEXT_SECONDARY }}
                  >
                    Akhir Proyek
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
