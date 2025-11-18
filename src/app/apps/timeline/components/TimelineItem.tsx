"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle, 
} from "lucide-react";
import { getStatus } from "../utils/timelineUtils";
import { Milestone } from "../types";
import {
  COLOR_BG_DARK,
  COLOR_BG_SECONDARY,
  COLOR_BORDER_DARK,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_SUCCESS,
  COLOR_ERROR,
  COLOR_PRIMARY,
} from "../constants";

interface TimelineItemProps {
  item: Milestone;
  onDelete: (id: string) => void;
  onEdit: (item: Milestone) => void;
  onUpdateStatus: (id: string, status: "completed" | "upcoming") => void;
}

export default function TimelineItem({
  item,
  onDelete,
  onEdit,
  onUpdateStatus,
}: TimelineItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentStatus = getStatus(item);

  const statusConfig = {
    completed: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: COLOR_SUCCESS,
      text: "Selesai",
    },
    current: {
      icon: <Clock className="w-5 h-5 animate-pulse" />,
      color: COLOR_PRIMARY,
      text: "Berlangsung",
    }, 
    upcoming: {
      icon: <Calendar className="w-5 h-5" />,
      color: COLOR_TEXT_SECONDARY,
      text: "Mendatang",
    },
    overdue: {
      icon: <AlertTriangle className="w-5 h-5" />,
      color: COLOR_ERROR,
      text: "Terlambat",
    },
  };

  const {
    icon,
    color,
    text: statusText,
  } = statusConfig[currentStatus as keyof typeof statusConfig] ||
  statusConfig.upcoming;

  const handleStatusUpdate = (newStatus: "completed" | "upcoming") => {
    onUpdateStatus(item.id, newStatus);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex relative pl-8 pb-10">
      <div className="absolute left-0 top-0 bottom-0 flex justify-center w-8">
        <div
          className="h-full w-px"
          style={{ backgroundColor: COLOR_BORDER_DARK }}
        ></div>
        <div
          className="absolute w-4 h-4 rounded-full flex items-center justify-center p-1"
          style={{ backgroundColor: COLOR_BG_DARK, top: "4px", left: "8px" }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
        </div>
      </div>

      <div
        className="flex-1 ml-4 -mt-1 p-3 rounded-lg border transition duration-300 hover:shadow-lg flex justify-between items-start gap-4"
        style={{
          backgroundColor: COLOR_BG_SECONDARY,
          borderColor: COLOR_BORDER_DARK,
        }}
      >
        <div className="flex-1">
          <div
            className="flex flex-col md:flex-row md:items-center justify-between mb-2 pb-2 border-b"
            style={{ borderColor: COLOR_BORDER_DARK }}
          >
            <div
              className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wide"
              style={{ color }}
            >
              {icon}
              <span>{statusText}</span>
            </div>
            <div
              className="text-xs mt-1 md:mt-0"
              style={{ color: COLOR_TEXT_SECONDARY }}
            >
              {item.start} <ArrowRight className="w-3 h-3 inline-block" />{" "}
              {item.end}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div
              className="md:col-span-1 p-3 rounded-lg text-center"
              style={{
                backgroundColor: COLOR_BG_DARK,
                border: `1px solid ${color}`,
              }}
            >
              <p
                className="text-xs uppercase"
                style={{ color: COLOR_TEXT_SECONDARY }}
              >
                Jadwal
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: COLOR_TEXT_PRIMARY }}
              >
                {item.dateLabel}
              </p>
            </div>
            <div className="md:col-span-3">
              <p
                className="text-lg font-semibold"
                style={{ color: COLOR_TEXT_PRIMARY }}
              >
                {item.title}
              </p>
              <p
                className="text-xs mt-1 hidden sm:block"
                style={{ color: COLOR_TEXT_SECONDARY }}
              >
                ID: {item.id}
              </p>
            </div>
          </div>
        </div>

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
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 z-10"
              style={{
                backgroundColor: COLOR_BG_DARK,
                border: `1px solid ${COLOR_BORDER_DARK}`,
              }}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              {currentStatus !== "completed" && (
                <button
                  onClick={() => handleStatusUpdate("completed")}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-green-900/50 transition"
                  style={{ color: COLOR_SUCCESS }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Tandai Selesai
                </button>
              )}

              {currentStatus === "completed" && (
                <button
                  onClick={() => handleStatusUpdate("upcoming")}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition"
                  style={{ color: COLOR_TEXT_PRIMARY }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Tandai Belum Selesai
                </button>
              )}

              <button
                onClick={() => {
                  onEdit(item);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition"
                style={{ color: COLOR_TEXT_PRIMARY }}
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </button>
              <button
                onClick={() => {
                  onDelete(item.id);
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
    </div>
  );
}
