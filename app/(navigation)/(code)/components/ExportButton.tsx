"use client";

import { Button } from "@/components/button";
import { ButtonGroup } from "@/components/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Kbd, Kbds } from "@/components/kbd";
import { CircleProgressIcon, DownloadIcon, CircleProgressIcon as SpinnerIcon } from "@raycast/icons";
import { track } from "@vercel/analytics";
import { saveAs } from "file-saver";
import hotkeys from "hotkeys-js";
import { useAtom, useAtomValue } from "jotai";
import { Base64 } from "js-base64";
import JSZip from "jszip";
import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import ArrowsExpandingIcon from "../assets/icons/arrows-expanding-16.svg";
import ClipboardIcon from "../assets/icons/clipboard-16.svg";
import ImageIcon from "../assets/icons/image-16.svg";
import LinkIcon from "../assets/icons/link-16.svg";
import type { UserFile } from "../hooks/useFiles";
import { toBlob, toPng, toSvg } from "../lib/image";
import { fileNameAtom, showBackgroundAtom } from "../store";
import { autoDetectLanguageAtom, selectedLanguageAtom } from "../store/code";
import { derivedFlashMessageAtom, flashShownAtom } from "../store/flash";
import { EXPORT_SIZE_OPTIONS, exportSizeAtom, SIZE_LABELS } from "../store/image";
import { paddingAtom } from "../store/padding";
import { darkModeAtom, themeAtom, themeLineNumbersAtom } from "../store/themes";
import download from "../util/download";
import { Language, LANGUAGES } from "../util/languages";
import usePngClipboardSupported from "../util/usePngClipboardSupported";
import Frame from "./Frame";

function SingleFileExportFrame({
  file,
  ephemeralDarkMode,
  ephemeralTheme,
  ephemeralBackground,
  ephemeralPadding,
  ephemeralLineNumbers,
  ephemeralLanguage,
  ephemeralCode,
  doneCallback,
}: {
  file: UserFile;
  ephemeralDarkMode: boolean;
  ephemeralTheme: any;
  ephemeralBackground: boolean;
  ephemeralPadding: number;
  ephemeralLineNumbers: boolean;
  ephemeralLanguage: Language | null;
  ephemeralCode: string;
  doneCallback: (elem: HTMLDivElement) => void;
}) {
  const ephemeralRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      if (ephemeralRef.current) {
        doneCallback(ephemeralRef.current);
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [doneCallback]);

  return (
    <div style={{ position: "absolute", left: "-99999px", top: 0 }}>
      <Frame
        ephemeralDarkMode={ephemeralDarkMode}
        ephemeralTheme={ephemeralTheme}
        ephemeralBackground={ephemeralBackground}
        ephemeralPadding={ephemeralPadding}
        ephemeralLineNumbers={ephemeralLineNumbers}
        ephemeralLanguage={ephemeralLanguage}
        ephemeralFileName={file.name}
        ephemeralCode={ephemeralCode}
        files={[file]}
        currentFile={file}
        handleChangeFile={() => {}}
        selectedFiles={[file]}
        resize={false}
        ephemeralRef={ephemeralRef}
      />
    </div>
  );
}

async function renderFileEphemeral(
  file: UserFile,
  opts: {
    ephemeralDarkMode: boolean;
    ephemeralTheme: any;
    ephemeralBackground: boolean;
    ephemeralPadding: number;
    ephemeralLineNumbers: boolean;
    ephemeralLanguage: Language | null;
    ephemeralCode: string;
  },
  exportAs: "png" | "svg",
  exportSize: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    let root: ReturnType<typeof createRoot> | null = null;

    const doneCallback = async (refNode: HTMLDivElement) => {
      try {
        if (exportAs === "png") {
          const dataUrl = await toPng(refNode, { pixelRatio: exportSize });
          resolve(dataUrl);
        } else {
          const dataUrl = await toSvg(refNode);
          resolve(dataUrl);
        }
      } catch (error) {
        reject(error);
      } finally {
        if (root) {
          root.unmount();
        }
        container.remove();
      }
    };

    root = createRoot(container);
    root.render(
      <SingleFileExportFrame
        file={file}
        ephemeralDarkMode={opts.ephemeralDarkMode}
        ephemeralTheme={opts.ephemeralTheme}
        ephemeralBackground={opts.ephemeralBackground}
        ephemeralPadding={opts.ephemeralPadding}
        ephemeralLineNumbers={opts.ephemeralLineNumbers}
        ephemeralLanguage={opts.ephemeralLanguage}
        ephemeralCode={opts.ephemeralCode}
        doneCallback={doneCallback}
      />,
    );
  });
}

type ExportButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "selectedFiles"> & {
  selectedFiles?: UserFile[];
};

const ExportButton: React.FC<ExportButtonProps> = (props) => {
  const { selectedFiles = [], ...buttonProps } = props;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pngClipboardSupported = usePngClipboardSupported();

  const [, setFlashMessage] = useAtom(derivedFlashMessageAtom);
  const [, setFlashShown] = useAtom(flashShownAtom);

  const customFileName = useAtomValue(fileNameAtom);
  const fileName = customFileName.replaceAll(" ", "-") || "ray-so-export";
  const [exportSize, setExportSize] = useAtom(exportSizeAtom);
  const selectedLanguage = useAtomValue(selectedLanguageAtom);
  const autoDetectLanguage = useAtomValue(autoDetectLanguageAtom);

  const darkMode = useAtomValue(darkModeAtom);
  const theme = useAtomValue(themeAtom);
  const showBackground = useAtomValue(showBackgroundAtom);
  const padding = useAtomValue(paddingAtom);
  const lineNumbers = useAtomValue(themeLineNumbersAtom);

  const multiSelect = selectedFiles.length > 1;
  const noneSelected = selectedFiles.length === 0;

  async function singleFileToPng() {
    try {
      setFlashMessage({ icon: <SpinnerIcon className="animate-spin" />, message: "Exporting PNG..." });

      const frame = document.getElementById("frame") as HTMLDivElement | null;
      if (!frame) throw new Error("No main #frame found in normal UI");
      const dataUrl = await toPng(frame, { pixelRatio: exportSize });
      download(dataUrl, `${fileName}.png`);
      setFlashMessage({ icon: <ImageIcon />, message: "Export complete!", timeout: 2000 });
    } catch (err) {
      console.error(err);
      setFlashMessage({ icon: <ImageIcon />, message: "Export failed!", timeout: 2000 });
    }
  }

  async function singleFileToSvg() {
    try {
      setFlashMessage({ icon: <SpinnerIcon className="animate-spin" />, message: "Exporting SVG..." });
      const frame = document.getElementById("frame") as HTMLDivElement | null;
      if (!frame) throw new Error("No main #frame found in normal UI");
      const dataUrl = await toSvg(frame);
      download(dataUrl, `${fileName}.svg`);
      setFlashMessage({ icon: <ImageIcon />, message: "Export complete!", timeout: 2000 });
    } catch (err) {
      console.error(err);
      setFlashMessage({ icon: <ImageIcon />, message: "Export failed!", timeout: 2000 });
    }
  }

  async function singleFileCopyPng() {
    try {
      setFlashMessage({ icon: <SpinnerIcon className="animate-spin" />, message: "Copying PNG..." });
      const frame = document.getElementById("frame") as HTMLDivElement | null;
      if (!frame) throw new Error("No main #frame found in normal UI");
      const blob = await toBlob(frame, { pixelRatio: exportSize });
      if (!blob) throw new Error("toBlob() returned null");
      const clipboardItem = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([clipboardItem]);
      setFlashMessage({ icon: <ClipboardIcon />, message: "PNG Copied to clipboard!", timeout: 2000 });
    } catch (err) {
      console.error(err);
      setFlashMessage({ icon: <ClipboardIcon />, message: "Copy failed!", timeout: 2000 });
    }
  }

  const bulkExportPng = async () => {
    setFlashMessage({
      icon: <SpinnerIcon className="animate-spin" />,
      message: "Exporting PNGs...",
    });

    const zip = new JSZip();
    const sanitizedExportName = fileName || "ray-so-export";

    for (const f of selectedFiles) {
      const dataUrl = await renderFileEphemeral(
        f,
        {
          ephemeralDarkMode: darkMode,
          ephemeralTheme: theme,
          ephemeralBackground: showBackground,
          ephemeralPadding: padding,
          ephemeralLineNumbers: lineNumbers,
          ephemeralLanguage: selectedLanguage,
          ephemeralCode: f.content,
        },
        "png",
        exportSize,
      );

      const nameNoSpaces = f.name.trim().length ? f.name.replaceAll(" ", "-") : "untitled";
      zip.file(`${nameNoSpaces}.png`, dataUrl.split(",")[1], { base64: true });
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${sanitizedExportName}-bulk.zip`);
    setFlashMessage({ icon: <ImageIcon />, message: "Export complete!", timeout: 2000 });
  };

  const bulkSaveSvg = async () => {
    setFlashMessage({ icon: <SpinnerIcon className="animate-spin" />, message: "Exporting SVGs..." });

    const zip = new JSZip();
    const sanitizedExportName = fileName || "ray-so-export";

    for (const f of selectedFiles) {
      const dataUrl = await renderFileEphemeral(
        f,
        {
          ephemeralDarkMode: darkMode,
          ephemeralTheme: theme,
          ephemeralBackground: showBackground,
          ephemeralPadding: padding,
          ephemeralLineNumbers: lineNumbers,
          ephemeralLanguage: selectedLanguage,
          ephemeralCode: f.content,
        },
        "svg",
        exportSize,
      );
      const nameNoSpaces = f.name.trim().length ? f.name.replaceAll(" ", "-") : "untitled";
      const svgContent = dataUrl.replace(/^data:image\/svg\+xml.*?,/, "");
      zip.file(`${nameNoSpaces}.svg`, svgContent);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${sanitizedExportName}-bulk.zip`);
    setFlashMessage({ icon: <ImageIcon />, message: "Export complete!", timeout: 2000 });
  };

  const bulkCopyUrl = async () => {
    setFlashMessage({ icon: <CircleProgressIcon className="animate-spin" />, message: "Copying URLs..." });

    const baseUrl = window.location.toString();
    const lines: string[] = [];

    for (const f of selectedFiles) {
      const base = new URL(baseUrl);
      const sp = new URLSearchParams(base.hash.replace(/^#/, ""));
      sp.set("title", f.name);
      sp.set("code", Base64.encodeURI(f.content));
      lines.push(`${base.origin}/#${sp.toString()}`);
    }
    await navigator.clipboard.writeText(lines.join("\n"));

    setFlashMessage({
      icon: <ClipboardIcon />,
      message: `URLs copied to clipboard!`,
      timeout: 2000,
    });
  };

  const handleExportClick: MouseEventHandler = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(window.location.hash.replace("#", "?"));
    track("Export", {
      theme: params.get("theme") || "candy",
      background: params.get("background") || "true",
      darkMode: params.get("darkMode") || "true",
      padding: params.get("padding") || "64",
      language: Object.keys(LANGUAGES).find((key) => LANGUAGES[key].name === selectedLanguage?.name) || "auto",
      autoDetectLanguage: autoDetectLanguage.toString(),
      title: params.get("title") || "untitled",
      width: params.get("width") || "auto",
      size: SIZE_LABELS[exportSize],
    });

    if (noneSelected) return;

    if (!multiSelect) {
      singleFileToPng();
    } else {
      bulkExportPng();
    }
  };

  async function copyUrl() {
    setFlashMessage({ icon: <SpinnerIcon className="animate-spin" />, message: "Copying URL..." });
    if (noneSelected) return;
    if (multiSelect) {
      await bulkCopyUrl();
      return;
    }

    const url = window.location.toString();
    let urlToCopy = url;
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`/api/shorten-url?url=${encodedUrl}&ref=codeImage`).then((res) => res.json());
    if (response.link) {
      urlToCopy = response.link;
    }
    await navigator.clipboard.writeText(urlToCopy);
    setFlashMessage({ icon: <ClipboardIcon />, message: "URL Copied to clipboard!", timeout: 2000 });
  }

  useEffect(() => {
    hotkeys("ctrl+k,cmd+k", (event) => {
      event.preventDefault();
      setDropdownOpen((open) => !open);
    });

    hotkeys("ctrl+s,cmd+s", (event) => {
      event.preventDefault();
      if (noneSelected) return;
      if (multiSelect) {
        bulkExportPng();
      } else {
        singleFileToPng();
      }
    });

    hotkeys("ctrl+c,cmd+c", (event) => {
      if (!pngClipboardSupported || multiSelect) return;
      event.preventDefault();
      singleFileCopyPng();
    });

    hotkeys("ctrl+shift+c,cmd+shift+c", (event) => {
      event.preventDefault();
      copyUrl();
    });

    hotkeys("ctrl+shift+s,cmd+shift+s", (event) => {
      event.preventDefault();
      if (noneSelected) return;
      if (multiSelect) {
        bulkSaveSvg();
      } else {
        singleFileToSvg();
      }
    });
  }, [
    noneSelected,
    multiSelect,
    copyUrl,
    bulkExportPng,
    bulkSaveSvg,
    singleFileToPng,
    singleFileToSvg,
    singleFileCopyPng,
    pngClipboardSupported,
  ]);

  const disabled = noneSelected;

  return (
    <ButtonGroup>
      <Button
        onClick={handleExportClick}
        variant="primary"
        aria-label="Export as PNG"
        className="w-4/5"
        disabled={disabled}
        {...buttonProps}
      >
        <DownloadIcon className="w-4 h-4" />
        Export <span className="hidden md:inline-block">Image</span>
      </Button>
      <DropdownMenu open={dropdownOpen} onOpenChange={(open) => setDropdownOpen(open)}>
        <DropdownMenuTrigger asChild>
          <Button variant="primary" aria-label="See other export options" className="w-1/5" disabled={disabled}>
            <CircleProgressIcon style={{ opacity: 0, position: "absolute" }} />
            {/* hidden icon for spacing */}
            <span style={{ position: "relative", left: "-8px" }}>
              <svg width="1" height="1" />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              if (multiSelect) {
                bulkExportPng();
              } else {
                singleFileToPng();
              }
              setDropdownOpen(false);
            }}
          >
            <ImageIcon /> {multiSelect ? "Save PNGs" : "Save PNG"}{" "}
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </Kbds>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              if (multiSelect) {
                bulkSaveSvg();
              } else {
                singleFileToSvg();
              }
              setDropdownOpen(false);
            }}
          >
            <ImageIcon /> {multiSelect ? "Save SVGs" : "Save SVG"}
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>S</Kbd>
            </Kbds>
          </DropdownMenuItem>

          {pngClipboardSupported && !multiSelect && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                singleFileCopyPng();
                setDropdownOpen(false);
              }}
            >
              <ClipboardIcon /> Copy Image
              <Kbds>
                <Kbd>⌘</Kbd>
                <Kbd>C</Kbd>
              </Kbds>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              copyUrl();
              setDropdownOpen(false);
            }}
          >
            <LinkIcon /> {multiSelect ? "Copy URLs" : "Copy URL"}
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>C</Kbd>
            </Kbds>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger value={SIZE_LABELS[exportSize]}>
              <ArrowsExpandingIcon /> Size
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={8}>
              <DropdownMenuRadioGroup value={exportSize.toString()}>
                {EXPORT_SIZE_OPTIONS.map((size) => (
                  <DropdownMenuRadioItem key={size} value={size.toString()} onSelect={() => setExportSize(size)}>
                    {SIZE_LABELS[size]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};

export default ExportButton;
