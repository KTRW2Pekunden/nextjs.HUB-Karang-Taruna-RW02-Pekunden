/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileItem, DriveResponseItem } from "../types/activityTypes";

interface UploadingFile {
  name: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  id?: string; 
}

export const useActivityDocs = () => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); 

  const router = useRouter();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const currentItems = useMemo(() => {
    const targetId = currentFolderId || rootFolderId;
    return items
      .filter((item) => item.parentId === targetId)
      .sort((a, b) => {
        if (a.type === "folder" && b.type !== "folder") return -1;
        if (a.type !== "folder" && b.type === "folder") return 1;
        return a.name.localeCompare(b.name);
      });
  }, [items, currentFolderId, rootFolderId]);

  const getBreadcrumb = (): FileItem[] => {
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

      const data: DriveResponseItem[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setItems([]);
        setRootFolderId(null);
        setCurrentFolderId(null);
        return;
      }

      const detectedRootId = data[0]?.parentId;
      setRootFolderId(detectedRootId || null);

      const formatted: FileItem[] = data.map((f: DriveResponseItem) => ({
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
      const parentId = currentFolderId || rootFolderId;
      if (!parentId) throw new Error("Root folder ID is not defined.");

      const res = await fetch("/api/activity-docs/gdrive-createFolder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: parentId,
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
    const parentId = currentFolderId || rootFolderId;

    if (!parentId) {
      alert("Root folder ID is not defined. Cannot upload.");
      return;
    }

    const initialQueue: UploadingFile[] = files.map((file) => ({
      name: file.name,
      progress: 0,
      status: "pending",
    }));
    setUploadQueue((prev) => [...prev, ...initialQueue]);
    const startIndex = uploadQueue.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("files", file);
      formData.append("parentId", parentId);

      const currentIndex = startIndex + i;

      setUploadQueue((prev) =>
        prev.map((item, index) =>
          index === currentIndex ? { ...item, status: "uploading" } : item
        )
      );

      try {
        const res = await fetch("/api/activity-docs/gdrive-upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal upload file");

        setUploadQueue((prev) =>
          prev.map((item, index) =>
            index === currentIndex
              ? {
                  ...item,
                  status: "completed",
                  progress: 100,
                  id: data.uploadedFileIds?.[0],
                }
              : item
          )
        );
      } catch (err) {
        console.error(`Error uploading file ${file.name}:`, err);

        setUploadQueue((prev) =>
          prev.map((item, index) =>
            index === currentIndex
              ? { ...item, status: "failed", progress: -1 }
              : item
          )
        );
      }
    }

    await fetchItems();

    setTimeout(() => {
      setUploadQueue((prev) =>
        prev.filter(
          (item) => item.status !== "completed" && item.status !== "failed"
        )
      );
    }, 5000);
  };

  const handleRename = async (id: string) => {
    if (!newName.trim()) return;
    const trimmedNewName = newName.trim();

    try {
      const res = await fetch("/api/activity-docs/gdrive-rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id, newName: trimmedNewName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal rename");

      setItems(
        items.map((item) =>
          item.id === id ? { ...item, name: trimmedNewName } : item
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
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Gagal menghapus item");
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (
      !confirm(
        `Yakin ingin menghapus ${selectedItems.length} item yang dipilih?`
      )
    )
      return;

    setLoading(true);

    try {
      const res = await fetch("/api/activity-docs/gdrive-bulkDelete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: selectedItems }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Gagal menghapus beberapa item");

      setItems((prevItems) =>
        prevItems.filter((item) => !selectedItems.includes(item.id))
      );

      setSelectedItems([]);
      setSelectedItem(null);
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert("Gagal menghapus item yang dipilih. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: FileItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      toggleSelectItem(item.id);
      setSelectedItem(null);
      return;
    }

    if (selectedItems.length > 0) {
      if (selectedItems.includes(item.id)) {
        setSelectedItems([]);
      } else {
        setSelectedItems([item.id]);
        setSelectedItem(null);
        return;
      }
    }

    setSelectedItem(item.id);
    if (item.type === "folder") {
      openFolder(item.id);
    } else if (item.type === "file") {
      window.open(`https://drive.google.com/file/d/${item.id}/view`, "_blank");
    }
  };

  const openFolder = (id: string | null) => {
    setCurrentFolderId(id);
    setSelectedItem(null);
    setRenamingId(null);
    setSelectedItems([]); 
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
    setRenamingId(null);
    setSelectedItems([]);
  };

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setNewName(currentName);
  };

  return {
    items,
    loading,
    currentFolderId,
    rootFolderId,
    newFolderName,
    setNewFolderName,
    showNewFolder,
    setShowNewFolder,
    selectedItem,
    renamingId,
    setRenamingId,
    newName,
    setNewName,
    currentItems,
    breadcrumb: getBreadcrumb(),
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
    isUploading: uploadQueue.some(
      (item) => item.status === "pending" || item.status === "uploading"
    ),
    selectedItems,
    toggleSelectItem,
  };
};

export type { UploadingFile };
