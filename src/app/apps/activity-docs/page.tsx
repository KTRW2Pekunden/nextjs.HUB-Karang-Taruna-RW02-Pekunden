/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  FolderPlus,
  Upload,
  Folder,
  File,
  Trash2,
  Edit2,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  createdAt: Date;
  size?: number;
  parentId?: string;
}

export default function ActivityDocumentation() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const router = useRouter();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const currentItems = items.filter(
    (item) => item.parentId === (currentFolderId || rootFolderId)
  );

  const getBreadcrumb = () => {
    const path: FileItem[] = [];
    let id = currentFolderId;
    while (id && id !== rootFolderId) {
      const folder = items.find((i) => i.id === id);
      if (folder) {
        path.unshift(folder);
        id = folder.parentId || null;
      } else break;
    }
    return path;
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activity-docs/gdrive-getData");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setItems([]);
        return;
      }

      const firstItem = data[0];
      const detectedRootId = firstItem.parentId;
      setRootFolderId(detectedRootId);

      const formatted: FileItem[] = data.map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt),
      }));

      setItems(formatted);
    } catch (err) {
      console.error("Error fetching items:", err);
      alert("Gagal memuat data dari Google Drive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/activity-docs/gdrive-createFolder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolderId || rootFolderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat folder");

      await fetchItems();
      setNewFolderName("");
      setShowNewFolder(false);
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Gagal membuat folder");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const formData = new FormData();

    files.forEach((file) => formData.append("files", file));
    formData.append("parentId", currentFolderId || rootFolderId || "");

    try {
      const res = await fetch("/api/activity-docs/gdrive-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload file");

      await fetchItems();
    } catch (err) {
      console.error("Error uploading files:", err);
      alert("Gagal upload file");
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setNewName(currentName);
  };

  const confirmRename = async (id: string) => {
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/activity-docs/gdrive-rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id, newName: newName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal rename");

      setItems(
        items.map((item) =>
          item.id === id ? { ...item, name: newName } : item
        )
      );

      setRenamingId(null);
      setNewName("");
    } catch (err) {
      console.error("Error renaming:", err);
      alert("Gagal rename item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;

    try {
      const res = await fetch("/api/activity-docs/gdrive-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");

      setItems(items.filter((item) => item.id !== id));
      setSelectedItem(null);
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Gagal menghapus item");
    }
  };

  const openFolder = (id: string) => {
    setCurrentFolderId(id);
    setSelectedItem(null);
  };

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.id);
    if (item.type === "folder") {
      openFolder(item.id);
    } else if (item.type === "file") {
      window.open(`https://drive.google.com/file/d/${item.id}/view`, "_blank");
    }
  };

  const goBack = () => {
    if (!currentFolderId) {
      router.push("/");
      return;
    }

    const folder = items.find((i) => i.id === currentFolderId);
    const parentId = folder?.parentId || null;

    if (!parentId || parentId === rootFolderId) {
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(parentId);
    }
    setSelectedItem(null);
  };

  const breadcrumb = getBreadcrumb();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#1C1F24" }}>
      <div
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#1C1F24", borderColor: "#2a2e35" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="inline-flex items-center justify-center p-2 rounded-lg transition"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2a2e35")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <ChevronLeft className="w-5 h-5" style={{ color: "#F5E9D6" }} />
            </button>
            <div>
              <h1
                className="text-lg md:text-xl font-bold"
                style={{ color: "#F5E9D6" }}
              >
                Dokumentasi Kegiatan
              </h1>
              <p className="text-xs md:text-sm" style={{ color: "#b8a88e" }}>
                Google Drive-like file manager
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div
          className="flex items-center gap-1 mb-4 text-xs md:text-sm"
          style={{ color: "#b8a88e" }}
        >
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`px-2 py-1 rounded transition ${
              !currentFolderId ? "font-medium" : ""
            }`}
            style={{
              color: !currentFolderId ? "#F5E9D6" : "#b8a88e",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#2a2e35")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Home
          </button>
          {breadcrumb.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              <button
                onClick={() => setCurrentFolderId(folder.id)}
                className={`px-2 py-1 rounded transition ${
                  currentFolderId === folder.id ? "font-medium" : ""
                }`}
                style={{
                  color: currentFolderId === folder.id ? "#F5E9D6" : "#b8a88e",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2a2e35")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
              style={{ borderColor: "#E77E4F" }}
            ></div>
            <p className="text-sm" style={{ color: "#b8a88e" }}>
              Memuat data dari Google Drive...
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-6">
              <button
                onClick={() => setShowNewFolder(!showNewFolder)}
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base font-medium"
                style={{ backgroundColor: "#E77E4F", color: "#F5E9D6" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d86d3f")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#E77E4F")
                }
              >
                <FolderPlus className="w-4 h-4 md:w-5 md:h-5" /> Folder Baru
              </button>

              <label
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition cursor-pointer text-sm md:text-base font-medium"
                style={{ backgroundColor: "#E77E4F", color: "#F5E9D6" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d86d3f")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#E77E4F")
                }
              >
                <Upload className="w-4 h-4 md:w-5 md:h-5" /> Upload File
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {showNewFolder && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nama folder baru..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") setShowNewFolder(false);
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2"
                  style={
                    {
                      backgroundColor: "#2a2e35",
                      borderColor: "#3a3e45",
                      color: "#F5E9D6",
                      "--tw-ring-color": "#E77E4F",
                    } as React.CSSProperties
                  }
                />
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 rounded-lg transition text-sm font-medium"
                  style={{ backgroundColor: "#E77E4F", color: "#F5E9D6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#d86d3f")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#E77E4F")
                  }
                >
                  Buat
                </button>
                <button
                  onClick={() => setShowNewFolder(false)}
                  className="px-4 py-2 rounded-lg transition text-sm font-medium"
                  style={{ backgroundColor: "#2a2e35", color: "#F5E9D6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#3a3e45")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2a2e35")
                  }
                >
                  Batal
                </button>
              </div>
            )}

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
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center justify-between gap-2 md:gap-4 p-2 md:p-3 rounded-lg transition group border ${
                      selectedItem === item.id ? "" : ""
                    }`}
                    style={{
                      backgroundColor:
                        selectedItem === item.id ? "#2a2e35" : "transparent",
                      borderColor:
                        selectedItem === item.id ? "#3a3e45" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedItem !== item.id) {
                        e.currentTarget.style.backgroundColor = "#252932";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedItem !== item.id) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
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
                            style={{
                              backgroundColor: "#2a2e35",
                              borderColor: "#3a3e45",
                              color: "#F5E9D6",
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmRename(item.id);
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmRename(item.id);
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
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(item.id, item.name);
                          }}
                          className="p-1 md:p-2 rounded transition"
                          title="Rename"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#3a3e45")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Edit2
                            className="w-4 h-4 md:w-5 md:h-5"
                            style={{ color: "#b8a88e" }}
                          />
                        </button>
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
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
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

            <div
              className="mt-8 text-center text-xs md:text-sm"
              style={{ color: "#7a7162" }}
            >
              <p>
                Total: {currentItems.length} item •{" "}
                {currentItems.filter((i) => i.type === "folder").length} folder
                • {currentItems.filter((i) => i.type === "file").length} file
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
