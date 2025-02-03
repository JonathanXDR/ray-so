import { Kbd } from "@/components/kbd";
import React from "react";
import { UserFile } from "../hooks/useFiles";

interface BulkEditPlaceholderProps {
  selectedFiles: UserFile[];
  className?: string;
}

const BulkEditPlaceholder: React.FC<BulkEditPlaceholderProps> = ({ selectedFiles, className = "" }) => {
  const fileCount = selectedFiles.length;
  const fileText = fileCount === 1 ? "file" : "files";

  return (
    <div
      role="region"
      aria-label="Bulk edit information"
      className={`flex flex-col justify-center p-32 border-2 border-dashed border-gray-6 rounded-lg space-y-4 ${className}`}
      tabIndex={0}
    >
      <h3 className="text-lg font-semibold">
        Bulk Edit Mode ({fileCount} {fileText})
      </h3>
      <div className="space-y-3 max-w-md">
        <p className="text-sm text-gray-11">
          <strong>{fileCount}</strong> {fileText} selected for bulk editing. Changes made here will affect all selected
          files.
        </p>
        <p className="text-sm text-gray-11">
          To deselect files, hold <Kbd size="medium">Ctrl/Cmd</Kbd> and click on the files you want to remove.
        </p>
        <p className="text-sm text-gray-11">
          You can modify shared properties such as:
          <ul className="mt-2 list-disc list-inside">
            <li>Theme</li>
            <li>Background</li>
            <li>Dark Mode</li>
            <li>Padding</li>
          </ul>
        </p>
        <p className="text-sm text-gray-11 italic">
          Pro tip: Use the preview feature to review changes before applying them to all selected files.
        </p>
      </div>
    </div>
  );
};

export default BulkEditPlaceholder;
