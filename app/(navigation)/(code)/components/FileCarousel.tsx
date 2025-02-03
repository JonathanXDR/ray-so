"use client";

import { Button } from "@/components/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@raycast/icons";
import { useState } from "react";
import type { UserFile } from "../hooks/useFiles";

interface FileCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  files: UserFile[];
  onChangeFile: (file: UserFile, index: number) => void;
  showButtons?: boolean;
  children?: React.ReactNode;
}

export function FileCarousel({ children, files, onChangeFile, showButtons, ...props }: FileCarouselProps) {
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
