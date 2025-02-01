"use client";
import { useState } from "react";
import { PatchFile } from "../lib/types";

export function usePatchFiles() {
  const [patchFiles, setPatchFiles] = useState<PatchFile[]>([]);
  const [currentPatch, setCurrentPatch] = useState<PatchFile | null>(null);

  function handleFilesSelected(files: PatchFile[]) {
    setPatchFiles(files);

    if (files.length > 0) {
      setCurrentPatch(files[0]);
    }
  }

  function handleChangeFile(file: PatchFile) {
    setCurrentPatch(file);
  }

  return {
    patchFiles,
    currentPatch,
    handleFilesSelected,
    handleChangeFile,
  };
}
