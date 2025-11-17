"use client";

import React from "react";
import { Folder, File, Trash2, Edit2 } from "lucide-react";
import { FileItem } from "../types/activityTypes";

interface ActivityFileListProps {
  currentItems: FileItem[];
  selectedItem: string | null;
  renamingId: string | null;
  newName: string;
  setNewName: (name: string) => void;
  setRenamingId: (id: string | null) => void;
  formatFileSize: (bytes: number) => string;
  handleItemClick: (item: FileItem, e: React.MouseEvent) => void;
  startRename: (id: string, currentName: string) => void;
  handleRename: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
}

export const ActivityFileList: React.FC<ActivityFileListProps> = ({
  currentItems,
  selectedItem,
  renamingId,
  newName,
  setNewName,
  setRenamingId,
  formatFileSize,
  handleItemClick,
  startRename,
  handleRename,
  handleDelete,
  selectedItems,
  toggleSelectItem,
}) => {
  const isItemSelected = (id: string) => selectedItems.includes(id);

  return (
    <div className="space-y-1">
      {currentItems.length === 0 ? (
        <div className="text-center py-12">
          <Folder
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "#3a3e45" }}
          />
          <p className="text-sm" style={{ color: "#b8a88e" }}>
            Folder kosong. Mulai dengan membuat folder atau upload file.
          </p>
        </div>
      ) : (
        currentItems.map((item) => (
          <div
            key={item.id}
            onClick={(e) => handleItemClick(item, e)}
            className={`flex items-center justify-between gap-2 md:gap-4 p-2 md:p-3 rounded-lg transition group border ${
              isItemSelected(item.id) ? "ring-2 ring-[#E77E4F]" : ""
            }`}
            style={{
              backgroundColor:
                selectedItem === item.id || isItemSelected(item.id)
                  ? "#2a2e35"
                  : "transparent",
              borderColor:
                selectedItem === item.id || isItemSelected(item.id)
                  ? "#3a3e45"
                  : "transparent",
            }}
            onMouseEnter={(e) => {
              if (selectedItem !== item.id && !isItemSelected(item.id)) {
                e.currentTarget.style.backgroundColor = "#252932";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedItem !== item.id && !isItemSelected(item.id)) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <input
              type="checkbox"
              checked={isItemSelected(item.id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelectItem(item.id);
              }}
              className="w-4 h-4 rounded appearance-none border border-[#3a3e45] checked:bg-[#E77E4F] checked:border-transparent transition shrink-0 cursor-pointer"
              style={
                {
                  backgroundColor: isItemSelected(item.id)
                    ? "#E77E4F"
                    : "#1C1F24",
                } as React.CSSProperties
              }
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              {item.type === "folder" ? (
                <Folder
                  className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                  style={{ color: "#E77E4F" }}
                />
              ) : (
                <File
                  className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                  style={{ color: "#E77E4F" }}
                />
              )}
              {renamingId === item.id ? (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="flex-1 px-2 py-1 border rounded text-xs md:text-sm"
                    style={
                      {
                        backgroundColor: "#2a2e35",
                        borderColor: "#3a3e45",
                        color: "#F5E9D6",
                      } as React.CSSProperties
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(item.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(item.id);
                    }}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: "#E77E4F",
                      color: "#F5E9D6",
                    }}
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <div className="flex-1 min-w-0 cursor-pointer">
                  <p
                    className="text-xs md:text-sm font-medium truncate"
                    style={{ color: "#F5E9D6" }}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: "#7a7162" }}>
                    {item.createdAt.toLocaleDateString("id-ID")}
                    {item.type === "file" &&
                      item.size &&
                      ` • ${formatFileSize(item.size)}`}
                  </p>
                </div>
              )}
            </div>

            {renamingId !== item.id && (
              <div
                className={`flex items-center gap-1 transition ${
                  isItemSelected(item.id) || selectedItem === item.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {!isItemSelected(item.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(item.id, item.name);
                    }}
                    className="p-1 md:p-2 rounded transition"
                    title="Rename"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#3a3e45")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Edit2
                      className="w-4 h-4 md:w-5 md:h-5"
                      style={{ color: "#b8a88e" }}
                    />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-1 md:p-2 rounded transition"
                  title="Delete"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#7f1d1d")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Trash2
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ color: "#ef4444" }}
                  />
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
