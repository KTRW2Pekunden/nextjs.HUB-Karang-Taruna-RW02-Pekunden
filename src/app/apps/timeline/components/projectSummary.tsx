import React, { useMemo } from "react";
import { Project, Milestone } from "../types";
import {
  COLOR_ACCENT,
  COLOR_BG_DARK,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_BORDER_DARK,
  COLOR_BG_SECONDARY,
  COLOR_SUCCESS,
  COLOR_ERROR,
  COLOR_PRIMARY
} from "../constants";
import { Clock, CheckCircle, Calendar, Loader } from "lucide-react";

interface Props {
  project: Project;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  return date.toLocaleDateString("id-ID", options);
};

const getProjectProgress = (timeline: Milestone[]): number => {
  if (timeline.length === 0) return 0;

  const completedCount = timeline.filter(
    (m) => m.status === "completed"
  ).length;
  return Math.round((completedCount / timeline.length) * 100);
};

const getTodayActivity = (timeline: Milestone[]): Milestone | null => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (
    timeline.find((m) => {
      if (m.status === "completed") return false;

      const start = new Date(m.start);
      const end = new Date(m.end);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return start.getTime() <= now.getTime() && end.getTime() >= now.getTime();
    }) || null
  );
};

export default function ProjectSummaryCard({ project }: Props) {
  const { timeline } = project;

  const progressPercentage = useMemo(
    () => getProjectProgress(timeline),
    [timeline]
  );
  const todayActivity = useMemo(() => getTodayActivity(timeline), [timeline]);

  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let ongoingCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;

    const completedCount = timeline.filter(
      (m) => m.status === "completed"
    ).length;

    timeline.forEach((m) => {
      if (m.status === "completed") return; 

      const start = new Date(m.start);
      const end = new Date(m.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const isOverdue = end.getTime() < now.getTime();
      const isUpcoming = start.getTime() > now.getTime();
      const isOnGoing =
        start.getTime() <= now.getTime() && end.getTime() >= now.getTime();

      if (isOverdue) {
        overdueCount++;
      } else if (isOnGoing) {
        ongoingCount++;
      } else if (isUpcoming) {
        upcomingCount++;
      }
    });

    return {
      total: timeline.length,
      completed: completedCount,
      ongoing: ongoingCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
    };
  }, [timeline]);

  const StatItem = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
  }) => (
    <div
      className="flex flex-col items-center p-3 rounded-lg flex-1 min-w-0"
      style={{
        backgroundColor: COLOR_BG_DARK,
        border: `1px solid ${COLOR_BORDER_DARK}`,
      }}
    >
      <Icon className="w-5 h-5 mb-1" style={{ color: color }} />
      <p className="text-xl font-bold" style={{ color: COLOR_TEXT_PRIMARY }}>
        {value}
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: COLOR_TEXT_SECONDARY, textAlign: "center" }}
      >
        {label}
      </p>
    </div>
  );

  return (
    <div
      className="mb-8 p-6 rounded-xl shadow-2xl"
      style={{
        backgroundColor: COLOR_BG_SECONDARY,
        border: `1px solid ${COLOR_BORDER_DARK}`,
      }}
    >
      <div className="flex justify-between items-center mb-5">
        <h3
          className="text-lg font-semibold"
          style={{ color: COLOR_TEXT_PRIMARY }}
        >
          Ringkasan Proyek
        </h3>
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: COLOR_ACCENT + "1A", color: COLOR_ACCENT }}
        >
          Total {stats.total} Kegiatan
        </span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p
            className="text-sm font-medium"
            style={{ color: COLOR_TEXT_PRIMARY }}
          >
            Progress Proyek
          </p>
          <p className="text-sm font-bold" style={{ color: COLOR_SUCCESS }}>
            {progressPercentage}%
          </p>
        </div>
        <div
          className="w-full h-3 rounded-full"
          style={{ backgroundColor: COLOR_BG_DARK }}
        >
          <div
            className="h-3 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: COLOR_SUCCESS,
            }}
          ></div>
        </div>
      </div>

      <div
        className="mb-6 pb-4 border-b"
        style={{ borderColor: COLOR_BORDER_DARK }}
      >
        <p
          className="text-sm font-medium mb-2"
          style={{ color: COLOR_TEXT_SECONDARY }}
        >
          Aktivitas Hari Ini ({formatDate(new Date().toISOString())})
        </p>
        {todayActivity ? (
          <div
            className="flex items-center p-3 rounded-lg"
            style={{ backgroundColor: COLOR_BG_DARK }}
          >
            <Loader
              className="w-5 h-5 mr-3 animate-spin"
              style={{ color: COLOR_PRIMARY }}
            />
            <span
              className="font-semibold"
              style={{ color: COLOR_TEXT_PRIMARY }}
            >
              {todayActivity.title}
            </span>
            <span className="ml-auto text-sm" style={{ color: COLOR_PRIMARY }}>
              Berlangsung
            </span>
          </div>
        ) : (
          <div
            className="text-sm p-3 rounded-lg"
            style={{
              backgroundColor: COLOR_BG_DARK,
              color: COLOR_TEXT_SECONDARY,
            }}
          >
            Tidak ada aktivitas terjadwal hari ini.
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <StatItem
          icon={CheckCircle}
          label="Selesai"
          value={stats.completed}
          color={COLOR_SUCCESS}
        />
        <StatItem
          icon={Clock}
          label="Mendatang"
          value={stats.upcoming}
          color={COLOR_ACCENT}
        />
        <StatItem
          icon={Loader}
          label="Berlangsung"
          value={stats.ongoing}
          color={COLOR_PRIMARY}
        />
        <StatItem
          icon={Calendar}
          label="Terlambat"
          value={stats.overdue}
          color={COLOR_ERROR}
        />
      </div>
    </div>
  );
}
