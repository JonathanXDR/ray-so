"use client";

import { Button } from "@/components/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/dialog";
import { toast } from "@/components/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { CircleProgressIcon, UploadIcon, XMarkTopRightSquareIcon } from "@raycast/icons";
import React, { useState } from "react";

export default function FileUpload({
  files,
  onFilesSelected,
  ...props
}: {
  files: File[];
  onFilesSelected: (files: File[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const filesArray = Array.from(fileList);
      await onFilesSelected(filesArray);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3" {...props}>
      <Tooltip>
        <TooltipTrigger asChild>
          {files.length === 0 ? (
            <Button iconOnly size="large" className="relative" disabled={uploading}>
              <input
                type="file"
                className="absolute top-0 right-0 bottom-0 left-0 cursor-pointer opacity-0"
                accept="*"
                onChange={handleFileChange}
                disabled={uploading}
                multiple
              />
              {!uploading ? (
                <UploadIcon className="!w-4 !h-4" />
              ) : (
                <CircleProgressIcon className="!w-4 !h-4 animate-spin" />
              )}
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button iconOnly size="large" className="relative" disabled={uploading}>
                  <XMarkTopRightSquareIcon className="!w-4 !h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent size="small">
                <div className="flex gap-8">
                  <div className="flex flex-col gap-3 flex-1 text-[13px] text-gray-11 leading-relaxed">
                    <DialogTitle>Delete files?</DialogTitle>
                    <p>Are you sure you want to delete all files?</p>
                    <div className="flex justify-end gap-3 mt-3">
                      <Button variant="secondary" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={() => onFilesSelected([])}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TooltipTrigger>
        <TooltipContent>{files.length === 0 ? "Upload files" : "Remove files"}</TooltipContent>
      </Tooltip>
    </div>
  );
}
