"use client";

import { Button } from "@/components/button";
import { toast } from "@/components/toast";
import { CircleProgressIcon, UploadIcon } from "@raycast/icons";
import React, { useState } from "react";
import * as uuid from "uuid";
import { File } from "../lib/types";

export default function FileUpload({ onFilesSelected, ...props }: { onFilesSelected: (files: File[]) => void }) {
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

      const data = await res.json();
      if (!data.results) {
        toast.error("No changed files found");
        return;
      }

      const patchFiles = data.results.map((resItem: any) => ({
        fileName: resItem.fileName,
        id: uuid.v7(),
      })) as File[];

      onFilesSelected(patchFiles);
      setFileNames(patchFiles.map((pf) => pf.fileName));
    } catch (error: any) {
      console.error("Error uploading .patch:", error);
      toast.error(error.message || "Error uploading patch");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 mb-3" {...props}>
      <Button iconOnly size="large" title="Upload files" className="relative" disabled={uploading}>
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
            {/* Upload */}
          </>
        )}
        {uploading && (
          <>
            <CircleProgressIcon className="animate-spin" />
            {/* Uploading... */}
          </>
        )}
      </Button>
    </div>
  );
}
