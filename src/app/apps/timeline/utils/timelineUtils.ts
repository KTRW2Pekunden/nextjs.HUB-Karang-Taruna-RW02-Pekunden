import { Milestone } from "../types";

export type DynamicStatus =
  | "completed"
  | "current"
  | "upcoming"
  | "overdue"
  | "on-going";

export const getStatus = (milestone: Milestone): DynamicStatus => {
  if (milestone.status === "completed") {
    return "completed";
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(milestone.start);
  const end = new Date(milestone.end);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end.getTime() < now.getTime()) {
    return "overdue";
  }

  if (start.getTime() <= now.getTime() && end.getTime() >= now.getTime()) {
    return "current";
  }
  return "upcoming";
};

export const calculateProjectDateRange = (timeline: Milestone[]) => {
  if (timeline.length === 0) {
    return { duration: "Tidak ada milestone" };
  }

  let minStart = new Date(timeline[0].start);
  let maxEnd = new Date(timeline[0].end);

  for (const item of timeline) {
    const s = new Date(item.start);
    const e = new Date(item.end);

    if (s.getTime() < minStart.getTime()) {
      minStart = s;
    }
    if (e.getTime() > maxEnd.getTime()) {
      maxEnd = e;
    }
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const startFmt = minStart.toLocaleDateString("id-ID", options);
  const endFmt = maxEnd.toLocaleDateString("id-ID", options);

  const durationText =
    minStart.toDateString() === maxEnd.toDateString()
      ? startFmt
      : `${startFmt} - ${endFmt}`;

  return { duration: durationText };
};
