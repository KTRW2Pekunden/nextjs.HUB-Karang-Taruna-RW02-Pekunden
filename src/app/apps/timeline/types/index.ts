export type Milestone = {
  id: string;
  dateLabel: string;
  start: string; 
  end: string;
  title: string;
  status?: "completed" | "upcoming"; 
};

export type Project = {
  id: string;
  name: string;
  description: string;
  timeline: Milestone[];
};