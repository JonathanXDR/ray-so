import { File as BufferFile } from "buffer";
import { File as DiffFile } from "gitdiff-parser";
import { Base64 } from "js-base64";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type UserFile = Partial<BufferFile> &
  Partial<DiffFile> & {
    name: string;
    id: string;
    content: string;
    isFromPatch: boolean;
  };

const LOCAL_STORAGE_KEY = "files";

function reconstructFullFileContent(file: UserFile) {
  if (file.type === "delete") {
    return "/* This file was deleted by the patch */";
  }

  if (file.hunks && file.hunks.length > 0) {
    const lines: string[] = [];

    for (const hunk of file.hunks) {
      let newLineIndex = hunk.newStart;

      for (const change of hunk.changes) {
        if (change.type === "normal" || change.type === "insert") {
          let lineText = change.content;
          if (lineText.startsWith("+") || lineText.startsWith(" ")) {
            lineText = lineText.substring(1);
          }
          lines.push(lineText);
          newLineIndex++;
        }
      }
    }

    if (lines.length === 0) {
      return "/* No new lines or the patch is empty for this file */";
    }

    return lines.join("\n");
  }

  return file.content || "";
}

function saveFilesToStorage(files: UserFile[]) {
  try {
    const encodedFiles = files.map((file) => ({
      ...file,
      content: Base64.encode(file.content),
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(encodedFiles));
    console.log("Saved files to localStorage:", encodedFiles);
  } catch (error) {
    console.error("Error saving files to localStorage:", error);
  }
}

function loadFilesFromStorage(): UserFile[] {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedData) {
      console.log("No saved files found in localStorage");
      return [];
    }

    const parsed = JSON.parse(savedData);
    if (!Array.isArray(parsed)) {
      console.error("Saved data is not an array:", parsed);
      return [];
    }

    const decodedFiles = parsed.map((file) => ({
      ...file,
      content: Base64.decode(file.content),
    }));

    console.log("Loaded files from localStorage:", decodedFiles);
    return decodedFiles;
  } catch (error) {
    console.error("Error loading files from localStorage:", error);
    return [];
  }
}

export function useFiles() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [currentFile, setCurrentFile] = useState<UserFile | null>(null);
  const [hasPatch, setHasPatch] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || initialized) return;

    const loadedFiles = loadFilesFromStorage();
    if (loadedFiles.length > 0) {
      setFiles(loadedFiles);
      setCurrentFile(loadedFiles[0]);
      setHasPatch(loadedFiles.some((f) => f.isFromPatch));
    }
    setInitialized(true);
  }, [initialized]);

  useEffect(() => {
    if (typeof window === "undefined" || !initialized) return;

    saveFilesToStorage(files);
    setHasPatch(files.some((f) => f.isFromPatch));
  }, [files, initialized]);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
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

          const data = await res.json();
          const diffFiles: UserFile[] = data.results.map((item: UserFile) => ({
            ...item,
            id: nanoid(),
            isFromPatch: true,
          }));

          newFiles.push(...diffFiles);
        } catch (err) {
          console.error("Error forwarding .patch file:", err);
        }
      } else {
        try {
          const fileContent = await file.text();
          newFiles.push({
            name: file.name,
            id: nanoid(),
            content: fileContent,
            isFromPatch: false,
          });
        } catch (err) {
          console.error("Error reading file content:", err);
        }
      }
    }

    setFiles((prevFiles) => {
      const merged = [...prevFiles, ...newFiles];
      saveFilesToStorage(merged);
      return merged;
    });

    if (newFiles.length > 0) {
      selectFile(newFiles[0]);
    }
  }, []);

  const selectFile = useCallback((file: UserFile) => {
    setCurrentFile(file);
  }, []);

  const handleChangeFile = useCallback(
    (file: UserFile) => {
      selectFile(file);
    },
    [selectFile],
  );

  const removeFile = useCallback(
    (fileToRemove: UserFile) => {
      setFiles((prevFiles) => {
        const updated = prevFiles.filter((f) => f.id !== fileToRemove.id);
        saveFilesToStorage(updated);
        return updated;
      });

      if (currentFile?.id === fileToRemove.id) {
        setCurrentFile(null);
      }
    },
    [currentFile?.id],
  );

  const updateFile = useCallback(
    (updated: UserFile) => {
      setFiles((prevFiles) => {
        const newFiles = prevFiles.map((f) => (f.id === updated.id ? updated : f));
        saveFilesToStorage(newFiles);
        return newFiles;
      });

      if (currentFile?.id === updated.id) {
        setCurrentFile(updated);
      }
    },
    [currentFile?.id],
  );

  const clearAllFiles = useCallback(() => {
    router.push("/");
    setFiles([]);
    setCurrentFile(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [router]);

  return {
    files,
    currentFile,
    hasPatch,
    handleFilesSelected,
    handleChangeFile,
    removeFile,
    updateFile,
    clearAllFiles,
    selectFile,
  };
}
