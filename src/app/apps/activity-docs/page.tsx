"use client";

import {
  ChevronLeft,
  FolderPlus,
  Upload,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useActivityDocs } from "./hooks/useActivityDocs";
import { ActivityFileList } from "./components/ActivityFileList";
import { FileItem } from "./types/activityTypes";
import { UploadTrackerCard } from "./components/UploadTrackerCard";

export default function ActivityDocumentation() {
  const {
    loading,
    currentFolderId,
    newFolderName,
    setNewFolderName,
    showNewFolder,
    setShowNewFolder,
    currentItems,
    selectedItem,
    renamingId,
    newName,
    setNewName,
    setRenamingId,
    breadcrumb,
    formatFileSize,
    openFolder,
    handleCreateFolder,
    handleFileUpload,
    handleRename,
    handleDelete,
    handleBulkDelete,
    handleItemClick,
    goBack,
    startRename,
    uploadQueue,
    selectedItems,
    toggleSelectItem,
  } = useActivityDocs();

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
            onClick={() => openFolder(null)}
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

          {breadcrumb.map((folder: FileItem) => (
            <div key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              <button
                onClick={() => openFolder(folder.id)}
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
            {selectedItems.length > 0 ? (
              <div
                className="flex items-center gap-4 mb-6 p-3 rounded-lg border"
                style={{ backgroundColor: "#2a2e35", borderColor: "#3a3e45" }}
              >
                <p className="text-sm font-medium" style={{ color: "#F5E9D6" }}>
                  {selectedItems.length} item dipilih
                </p>

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium"
                  style={{ backgroundColor: "#991b1b", color: "#F5E9D6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#7f1d1d")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#991b1b")
                  }
                >
                  <Trash2 className="w-4 h-4" /> Hapus Semua
                </button>
              </div>
            ) : (
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
            )}

            {showNewFolder && (
              <div className="mb-4 flex max-sm:flex-col max-sm:gap-4 gap-2 md:items-center">
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
                <div className="space-x-2">
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
              </div>
            )}

            <ActivityFileList
              currentItems={currentItems}
              selectedItem={selectedItem}
              renamingId={renamingId}
              newName={newName}
              setNewName={setNewName}
              setRenamingId={setRenamingId}
              formatFileSize={formatFileSize}
              handleItemClick={handleItemClick}
              startRename={startRename}
              handleRename={handleRename}
              handleDelete={handleDelete}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
            />

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

      <UploadTrackerCard uploadQueue={uploadQueue} />
    </main>
  );
}
