"use client";

import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

export interface UserFile {
  id: string;
  name: string;
  content: string;
  highlightDiff?: boolean;
}

const LOCAL_STORAGE_KEY = "raycast-user-files";

export function useFiles() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [currentFile, setCurrentFile] = useState<UserFile | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: UserFile[] = JSON.parse(saved);
        setFiles(parsed);
        if (parsed.length > 0) setCurrentFile(parsed[0]);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  async function handleFilesSelected(selectedFiles: File[]) {
    const newFiles: UserFile[] = [];

    for (const file of selectedFiles) {
      if (file.name.endsWith(".patch")) {
        const formData = new FormData();
        formData.append("patchFile", file);

        try {
          const res = await fetch("/api/diff", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            console.error("Error uploading .patch file", await res.text());
            continue;
          }

          type DiffResult = {
            fileName: string;
            content: string;
          };

          const data = await res.json();

          const diffFiles: UserFile[] = data.results.map((item: DiffResult) => ({
            id: nanoid(),
            name: item.fileName,
            content: item.content || "",
            highlightDiff: false,
          }));

          newFiles.push(...diffFiles);
        } catch (err) {
          console.error("Error forwarding .patch file:", err);
        }
      } else {
        const fileContent = await file.text();
        newFiles.push({
          id: nanoid(),
          name: file.name,
          content: fileContent,
          highlightDiff: false,
        });
      }
    }

    setFiles(newFiles);
    if (newFiles.length > 0) {
      setCurrentFile(newFiles[0]);
    }
  }

  function handleChangeFile(file: UserFile) {
    setCurrentFile(file);
  }

  function removeFile(fileToRemove: UserFile) {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileToRemove.id);
      if (currentFile?.id === fileToRemove.id) {
        return updated.length > 0 ? updated : [];
      }
      return updated;
    });

    if (currentFile?.id === fileToRemove.id) {
      setCurrentFile(null);
    }
  }

  function updateFile(updated: UserFile) {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    if (currentFile?.id === updated.id) {
      setCurrentFile(updated);
    }
  }

  function clearAllFiles() {
    setFiles([]);
    setCurrentFile(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  return {
    files,
    currentFile,
    handleFilesSelected,
    handleChangeFile,
    removeFile,
    updateFile,
    clearAllFiles,
  };
}
