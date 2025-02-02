"use client";

import { Button } from "@/components/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@raycast/icons";
import { useState } from "react";

export function FileCarousel({
  children,
  files,
  onChangeFile,
  showButtons,
  ...props
}: {
  children?: React.ReactNode;
  files: File[];
  onChangeFile: (file: File, index: number) => void;
  showButtons?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleSelect(index: number) {
    setCurrentIndex(index);
    onChangeFile(files[index], index);
  }

  return (
    <div {...props}>
      {showButtons && (
        <Button
          iconOnly
          size="large"
          onClick={() => handleSelect((currentIndex - 1 + files.length) % files.length)}
          disabled={files.length <= 1}
          title="Previous file"
        >
          <ChevronLeftIcon className="!w-4 !h-4" />
        </Button>
      )}

      {children && <div className="w-full">{children}</div>}

      {showButtons && (
        <Button
          iconOnly
          size="large"
          onClick={() => handleSelect((currentIndex + 1) % files.length)}
          disabled={files.length <= 1}
          title="Next file"
        >
          <ChevronRightIcon className="!w-4 !h-4" />
        </Button>
      )}
    </div>
  );
}
