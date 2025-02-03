"use client";

import { File as BufferFile } from "buffer";
import { File as DiffFile } from "gitdiff-parser";
import { Base64 } from "js-base64";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type UserFile = Partial<BufferFile> &
  DiffFile & {
    name: string;
    id: string;
    content: string;
    isFromPatch: boolean;
  };

const LOCAL_STORAGE_KEY = "raycast-user-files";

function reconstructFullFileContent(file: any) {
  // if the file was deleted, we can skip it unless the highlight option is enabled. In that case, we can return the full content but highlighted as deleted.

  const lines: string[] = [];

  for (const hunk of file.hunks) {
    let newLineIndex = hunk.newStart;

    for (const change of hunk.changes) {
      if (change.type === "insert" || change.type === "normal") {
        let lineText = change.content;
        if (lineText.startsWith("+") || lineText.startsWith(" ")) {
          lineText = lineText.substring(1);
        }
        lines.push(lineText);
        newLineIndex++;
      } else {
      }
    }
  }

  if (lines.length === 0) {
    return "/* No new lines or the patch is empty for this file */";
  }

  return lines.join("\n");
}

export function useFiles() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [currentFile, setCurrentFile] = useState<UserFile | null>(null);
  const [hasPatch, setHasPatch] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        let parsed: UserFile[] = JSON.parse(saved);
        parsed = parsed.map((f) => ({
          ...f,
          content: Base64.decode(f.content),
        }));
        setFiles(parsed);
        if (parsed.length > 0) {
          setCurrentFile(parsed[0]);
          setHasPatch(parsed.some((f) => f.isFromPatch));
        }
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const encodedFiles = files.map((f) => ({
      ...f,
      content: Base64.encodeURI(f.content),
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(encodedFiles));

    setHasPatch(files.some((f) => f.isFromPatch));
  }, [files]);

  async function handleFilesSelected(selectedFiles: UserFile[]) {
    const newFiles: UserFile[] = [];

    for (const file of selectedFiles) {
      if (file.name.endsWith(".patch")) {
        const formData = new FormData();
        formData.append("patchFile", file as unknown as Blob);

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

          const diffFiles: UserFile[] = data.results.map((item: UserFile) => {
            return {
              ...item,
              id: nanoid(),
              isFromPatch: true,
            };
          });

          newFiles.push(...diffFiles);
        } catch (err) {
          console.error("Error forwarding .patch file:", err);
        }
      } else {
        const fileContent = (await file?.text?.()) ?? "";
        newFiles.push({
          ...file,
          id: nanoid(),
          content: fileContent,
          isFromPatch: false,
        });
      }
    }

    setFiles((prev) => {
      const merged = [...prev, ...newFiles];
      return merged;
    });

    if (newFiles.length > 0) {
      selectFile(newFiles[0]);
    }
  }

  function selectFile(file: UserFile) {
    setCurrentFile(file);
  }

  function handleChangeFile(file: UserFile) {
    selectFile(file);
  }

  function removeFile(fileToRemove: UserFile) {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileToRemove.id);

      if (currentFile?.id === fileToRemove.id) {
        return updated;
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
    router.push("/");
    setFiles([]);
    setCurrentFile(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

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
