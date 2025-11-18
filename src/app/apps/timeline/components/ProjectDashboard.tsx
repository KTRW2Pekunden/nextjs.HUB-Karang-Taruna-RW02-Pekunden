import { Project } from "../types";
import {
  COLOR_ACCENT,
  COLOR_BG_SECONDARY,
  COLOR_BORDER_DARK,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_ERROR,
  COLOR_BG_DARK,
  COLOR_PRIMARY,
} from "../constants";
import {
  ArrowRight,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  Calendar,
} from "lucide-react";
import { useState } from "react";

interface Props {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const formatDate = (dateString: string, includeYear: boolean): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  if (includeYear) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("id-ID", options);
};

const getProjectStatusSummary = (project: Project) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const sortedMilestones = [...project.timeline].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const total = project.timeline.length;
  let completed = 0;
  let ongoing = 0;
  let upcoming = 0;
  let duedate = 0;

  project.timeline.forEach((m) => {
    if (m.status === "completed") {
      completed++;
      return;
    }

    const start = new Date(m.start);
    const end = new Date(m.end);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end.getTime() < now.getTime()) {
      duedate++;
      return;
    }
    
    if (start.getTime() <= now.getTime() && end.getTime() >= now.getTime()) {
      ongoing++;
    } else if (start.getTime() > now.getTime()) {
      upcoming++;
    }
  });

  let statusText = "Belum Ada Kegiatan";
  let statusColor = COLOR_TEXT_SECONDARY;
  let statusTextColor = COLOR_TEXT_SECONDARY;

  if (total > 0) {
    if (completed === total) {
      statusText = "Selesai 100%";
      statusColor = "#10B981"; 
    } else {
      const parts: string[] = [];

      if (completed > 0) parts.push(`${completed} Selesai`);
      if (ongoing > 0) parts.push(`${ongoing} Berlangsung`);
      if (upcoming > 0) parts.push(`${upcoming} Mendatang`);
      if (duedate > 0) parts.push(`${duedate} Terlambat`);

      statusText = parts.join(", ");

      if (duedate > 0) {
        statusColor = COLOR_ERROR; 
      } else if (ongoing > 0 || upcoming > 0) {
        statusColor = COLOR_ACCENT; 
      } else {
        statusColor = COLOR_TEXT_SECONDARY;
      }
    }
    statusTextColor = statusColor;
  }

  let dateRange = "Tanggal belum ditentukan";
  if (sortedMilestones.length > 0) {
    const startDateString = sortedMilestones[0].start;
    const endDateString = sortedMilestones[sortedMilestones.length - 1].end;

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    const includeStartYear = startYear !== endYear;

    const formattedStart = formatDate(startDateString, includeStartYear);
    const formattedEnd = formatDate(endDateString, true);

    dateRange = `${formattedStart} - ${formattedEnd}`;
  }

  return {
    total,
    completed,
    ongoing,
    upcoming,
    statusText,
    statusColor,
    statusTextColor,
    dateRange,
  };
};

export default function ProjectDashboard({
  projects,
  onSelectProject,
  onEditProject,
  onDeleteProject,
}: Props) {
  const activeProjects = projects.filter(
    (p) => getProjectStatusSummary(p).statusText !== "Selesai 100%"
  );
  const completedProjects = projects.filter(
    (p) => getProjectStatusSummary(p).statusText === "Selesai 100%"
  );

  if (projects.length === 0) {
    return (
      <div
        className="text-center p-8 border border-dashed rounded-lg"
        style={{
          borderColor: COLOR_BORDER_DARK,
          color: COLOR_TEXT_SECONDARY,
          backgroundColor: COLOR_BG_SECONDARY,
        }}
      >
        <Clock className="w-8 h-8 mx-auto mb-3" />
        <p className="font-semibold">Belum Ada Proyek</p>
        <p className="text-sm">Silakan buat proyek baru untuk memulai.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProjectList
        title="Proyek Aktif"
        projects={activeProjects}
        onSelectProject={onSelectProject}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
      />

      <ProjectList
        title="Proyek Selesai (100%)"
        projects={completedProjects}
        onSelectProject={onSelectProject}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
      />
    </div>
  );
}

interface ProjectListProps extends Props {
  title: string;
  projects: Project[];
}

function ProjectList({
  title,
  projects,
  onSelectProject,
  onEditProject,
  onDeleteProject,
}: ProjectListProps) {
  if (projects.length === 0 && title.includes("Aktif")) return null;
  if (projects.length === 0 && title.includes("Selesai")) return null;

  return (
    <div>
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: COLOR_TEXT_PRIMARY }}
      >
        {title} ({projects.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelectProject={onSelectProject}
            onEditProject={onEditProject}
            onDeleteProject={onDeleteProject}
          />
        ))}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onSelectProject: (id: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

function ProjectCard({
  project,
  onSelectProject,
  onEditProject,
  onDeleteProject,
}: ProjectCardProps) {
  const { statusText, statusColor, statusTextColor, dateRange } =
    getProjectStatusSummary(project);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className="p-5 rounded-xl border flex flex-col transition duration-300 hover:shadow-2xl"
      style={{
        backgroundColor: COLOR_BG_SECONDARY,
        borderColor: COLOR_BORDER_DARK,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: statusColor + "1A",
            color: statusTextColor,
          }}
        >
          {statusText}
        </span>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-full text-xs hover:bg-gray-600/50 transition duration-150 mt-1"
            style={{ color: COLOR_TEXT_SECONDARY }}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-40 rounded-lg shadow-xl py-1 z-10"
              style={{
                backgroundColor: COLOR_BG_DARK,
                border: `1px solid ${COLOR_BORDER_DARK}`,
              }}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition"
                style={{ color: COLOR_TEXT_PRIMARY }}
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-900/50 transition"
                style={{ color: COLOR_ERROR }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      <h3
        className="text-xl font-bold mb-2 truncate"
        style={{ color: COLOR_TEXT_PRIMARY }}
      >
        {project.name}
      </h3>
      <p
        className="text-sm mb-2 grow overflow-hidden text-ellipsis line-clamp-3"
        style={{ color: COLOR_TEXT_SECONDARY }}
      >
        {project.description}
      </p>

      <div
        className="flex items-center text-xs mb-4 pt-1 border-t"
        style={{ borderColor: COLOR_BORDER_DARK, color: COLOR_TEXT_SECONDARY }}
      >
        <Calendar className="w-3 h-3 mr-2 shrink-0" />
        <span className="truncate">{dateRange}</span>
      </div>

      <button
        onClick={() => onSelectProject(project.id)}
        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
        style={{
          backgroundColor: COLOR_ACCENT,
          color: COLOR_BG_DARK,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = COLOR_PRIMARY)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = COLOR_ACCENT)
        }
      >
        Lihat Timeline <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}