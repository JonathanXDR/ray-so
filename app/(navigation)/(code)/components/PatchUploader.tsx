"use client";

import { Button } from "@/components/button";
import { toast } from "@/components/toast";
import { CircleProgressIcon, UploadIcon } from "@raycast/icons";
import React, { useState } from "react";
import { PatchFile } from "../lib/types";

export default function PatchUploader({
  onFilesSelected,
}: {
  /**
   * A callback invoked after the patch is processed.
   * Returns an array of PatchFile { fileName, code }.
   */
  onFilesSelected: (files: PatchFile[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileNames([]);
    try {
      const formData = new FormData();
      formData.append("patchFile", file);

      const res = await fetch("/api/diff", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error uploading patch");
      }

      // Suppose your /api/diff endpoint returns something like:
      // {
      //   results: [
      //     { fileName: "foo.js", base64Image?: string, code: "diff..." },
      //     ...
      //   ]
      // }
      const data = await res.json();
      if (!data.results) {
        toast.error("No changed files found");
        return;
      }

      // Convert server result into our PatchFile[] shape
      const patchFiles = data.results.map((resItem: any) => ({
        fileName: resItem.fileName,
        code: resItem.code || "", // or diff lines, etc.
      })) as PatchFile[];

      // Expose the patch files to parent
      onFilesSelected(patchFiles);

      // Show just the filenames in this UI
      setFileNames(patchFiles.map((pf) => pf.fileName));
    } catch (error: any) {
      console.error("Error uploading .patch:", error);
      toast.error(error.message || "Error uploading patch");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button size="large" title="Upload your own SVG" className="relative" disabled={uploading}>
        <input
          type="file"
          className="absolute top-0 right-0 bottom-0 left-0 cursor-pointer opacity-0"
          accept=".patch"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {!uploading && (
          <>
            <UploadIcon className="!w-4 !h-4" />
            Upload Patch
          </>
        )}
        {uploading && (
          <>
            <CircleProgressIcon className="animate-spin" />
            Uploading...
          </>
        )}
      </Button>

      <ul className="flex flex-col text-sm gap-1">
        {fileNames.map((name) => (
          <li key={name} className="border-l-2 border-gray-5 pl-2">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
