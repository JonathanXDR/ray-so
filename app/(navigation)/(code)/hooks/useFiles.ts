"use client";
import { useState } from "react";
import { File } from "../lib/types";

export function usePatchFiles() {
  const [patchFiles, setPatchFiles] = useState<File[]>([]);
  const [currentPatch, setCurrentPatch] = useState<File | null>(null);

  function handleFilesSelected(files: File[]) {
    setPatchFiles(files);

    if (files.length > 0) {
      setCurrentPatch(files[0]);
    }
  }

  function handleChangeFile(file: File) {
    setCurrentPatch(file);
  }

  return {
    patchFiles,
    currentPatch,
    handleFilesSelected,
    handleChangeFile,
  };
}
