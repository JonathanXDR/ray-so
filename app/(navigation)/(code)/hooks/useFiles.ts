"use client";
import { useState } from "react";

interface DiffResult {
  content: string;
  fileName: string;
}

interface DiffResponse {
  results: DiffResult[];
}

export function useFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  async function handleFilesSelected(selectedFiles: File[]) {
    const processedFiles: File[] = [];

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
          const data = await res.json();

          const diffFiles: File[] = (data as DiffResponse).results.map((item: DiffResult) => {
            const blob = new Blob([item.content || ""], { type: "text/plain" });
            return new File([blob], item.fileName, { lastModified: Date.now() });
          });
          processedFiles.push(...diffFiles);
        } catch (err) {
          console.error("Error forwarding .patch file:", err);
        }
      } else {
        processedFiles.push(file);
      }
    }

    setFiles(processedFiles);
    if (processedFiles.length > 0) {
      setCurrentFile(processedFiles[0]);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("files", JSON.stringify(processedFiles.map((f) => ({ name: f.name, size: f.size }))));
    }
  }

  function handleChangeFile(file: File) {
    setCurrentFile(file);
  }

  function removeFile(fileToRemove: File) {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
    if (currentFile === fileToRemove) setCurrentFile(null);
  }

  function updateFile(updatedFile: File) {
    setFiles((prev) => prev.map((f) => (f === updatedFile ? updatedFile : f)));
    if (currentFile === updatedFile) setCurrentFile(updatedFile);
  }

  return {
    files,
    currentFile,
    handleFilesSelected,
    handleChangeFile,
    removeFile,
    updateFile,
  };
}
