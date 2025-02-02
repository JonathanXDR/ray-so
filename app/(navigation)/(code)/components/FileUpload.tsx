"use client";

import { Button } from "@/components/button";
import { toast } from "@/components/toast";
import { CircleProgressIcon, UploadIcon } from "@raycast/icons";
import React, { useState } from "react";

export default function FileUpload({ onFilesSelected, ...props }: { onFilesSelected: (files: File[]) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const filesArray = Array.from(fileList);
      await onFilesSelected(filesArray);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error((error as Error).message || "Error uploading file");
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
          accept="*"
          onChange={handleFileChange}
          disabled={uploading}
          multiple
        />
        {!uploading ? <UploadIcon className="w-4! h-4!" /> : <CircleProgressIcon className="animate-spin" />}
      </Button>
    </div>
  );
}
