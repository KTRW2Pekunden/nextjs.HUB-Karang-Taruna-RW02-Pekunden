"use client";

import React, { useState } from "react";
import { MeetingNote } from "../types/meetingTypes";
import { Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate } from "../utils/formatDate";

interface MeetingNoteListProps {
  meetingNotes: MeetingNote[];
  handleEdit: (note: MeetingNote) => void;
  handleDelete: (id: string, folderUrl: string) => Promise<void>;
}

export const MeetingNoteList: React.FC<MeetingNoteListProps> = ({
  meetingNotes,
  handleEdit,
  handleDelete,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setIsScrolled(target.scrollTop > 0);
  };

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "#2a2e35" }}
    >
      <div
        className="max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-auto"
        onScroll={handleScroll}
      >
        <table className="w-full text-sm relative">
          <thead
            className={`sticky top-0 z-10 border-b transition-shadow duration-300 ${
              isScrolled ? "shadow-lg" : ""
            }`}
            style={{
              backgroundColor: "#1C1F24",
              borderColor: "#2a2e35",
              color: "#F5E9D6",
            }}
          >
            <tr>
              <th
                className="p-3 text-center min-w-[120px]"
                style={{ backgroundColor: "#1C1F24" }}
              >
                Tanggal
              </th>
              <th
                className="p-3 text-center min-w-[70px]"
                style={{ backgroundColor: "#1C1F24" }}
              >
                Mulai
              </th>
              <th
                className="p-3 text-center min-w-[70px]"
                style={{ backgroundColor: "#1C1F24" }}
              >
                Selesai
              </th>
              <th
                className="p-3 text-center min-w-[300px]"
                style={{ backgroundColor: "#1C1F24" }}
              >
                Notulen
              </th>
              <th
                className="p-3 text-center min-w-[100px]"
                style={{ backgroundColor: "#1C1F24" }}
              >
                Dokumentasi
              </th>
              <th
                className="p-3 text-center min-w-20"
                style={{ backgroundColor: "#1C1F24" }}
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody
            className="divide-y"
            style={{ backgroundColor: "#1C1F24", borderColor: "#2a2e35" }}
          >
            {meetingNotes.map((note) => (
              <tr
                key={note.id}
                className="transition-colors"
                style={{ color: "#F5E9D6" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2a2e35")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td className="p-3 text-center align-top">
                  {formatDate(note.date)}
                </td>
                <td className="p-3 text-center align-top">{note.startTime}</td>
                <td className="p-3 text-center align-top">{note.endTime}</td>
                <td className="p-3 text-left align-top whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {note.notulen}
                  </ReactMarkdown>
                </td>
                <td className="p-3 text-center align-top">
                  {note.docURL ? (
                    <a
                      href={note.docURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: "#E77E4F" }}
                    >
                      Buka Folder
                    </a>
                  ) : (
                    <span style={{ color: "#b8a88e" }}>
                      Tidak ada dokumentasi
                    </span>
                  )}
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-row gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-2 rounded transition-colors"
                      style={{ color: "#F5E9D6" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#E77E4F")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      title="Edit notulen"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id, note.docURL)}
                      className="p-2 rounded transition-colors"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#7f1d1d")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      title="Hapus notulen"
                    >
                      <Trash2
                        className="w-4 h-4"
                        style={{ color: "#ef4444" }}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};