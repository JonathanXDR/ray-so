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
      <h3 className="text-lg font-semibold">Bulk Edit Mode</h3>
      <div className="space-y-3 max-w-md">
        <p className="text-sm text-gray-11">
          You have selected <strong>{fileCount}</strong> {fileText}. Any changes made now will apply to all selected
          files. To deselect individual files, hold <Kbd size="medium">Ctrl/Cmd</Kbd> and click them, or use the button
          on the left to deselect all.
        </p>
      </div>
    </div>
  );
};

export default BulkEditPlaceholder;
