"use client";

import { Button } from "@/components/button";
import { toast } from "@/components/toast";
import React, { useState } from "react";
import Image16Icon from "../assets/icons/image-16.svg";

type DiffResult = {
  fileName: string;
  base64Image: string;
};

export default function PatchUploader() {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<DiffResult[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setImages([]);
    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append("patchFile", file);

      // Send to /api/diff
      const res = await fetch("/api/diff", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }
      const data = await res.json();
      if (data?.results?.length) {
        setImages(data.results);
      } else {
        toast.error("No changed files found in patch");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error uploading patch");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <label className="text-sm text-gray-10">
        Upload a <code>.patch</code> file:
      </label>
      <input type="file" accept=".patch" onChange={handleFileChange} disabled={uploading} />

      {images.length > 0 && (
        <div className="flex flex-col w-full mt-2 gap-4">
          {images.map((result) => (
            <div key={result.fileName}>
              <div className="text-sm text-gray-9 mb-1 font-medium">{result.fileName}</div>
              <img
                src={result.base64Image}
                alt={`Patch snippet for ${result.fileName}`}
                className="border border-gray-a3 rounded"
              />
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <Button variant="secondary" disabled iconOnly>
          <Image16Icon />
          Uploading...
        </Button>
      )}
    </div>
  );
}
