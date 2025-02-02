"use client";
import { Button } from "@/components/button";
import { Input, InputSlot } from "@/components/input";
import { NavigationActions } from "@/components/navigation";
import { ScrollArea } from "@/components/scroll-area";
import { Switch } from "@/components/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { useSectionInViewObserver } from "@/utils/useSectionInViewObserver";
import * as Collapsible from "@radix-ui/react-collapsible";
import { BlankDocumentIcon, ChevronDownIcon, Info01Icon, MagnifyingGlassIcon, TrashIcon } from "@raycast/icons";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { createHighlighterCore, Highlighter } from "shiki";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import tailwindDark from "./assets/tailwind/dark.json";
import tailwindLight from "./assets/tailwind/light.json";
import styles from "./code.module.css";
import Controls from "./components/Controls";
import ExportButton from "./components/ExportButton";
import FileUpload from "./components/FileUpload";
import FormatButton from "./components/FormatCodeButton";
import Frame from "./components/Frame";
import { InfoDialog } from "./components/InfoDialog";
import { Instructions } from "./components/Instructions";
import NoSSR from "./components/NoSSR";
import { useFiles } from "./hooks/useFiles";
import { highlighterAtom } from "./store";
import FrameContextStore from "./store/FrameContextStore";
import { shikiTheme } from "./store/themes";
import { isTouchDevice } from "./util/isTouchDevice";
import { LANGUAGES } from "./util/languages";

// function extractFiles(elements: Element[], files: File[]): File[] {
//   const result: File[] = [];
//   for (const el of elements) {
//     const fileName = el.getAttribute("data-file-name");
//     if (!fileName) continue;
//     const found = files.find((f) => f.name === fileName);
//     if (found) result.push(found);
//   }
//   return result;
// }

export function Code() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const { files, currentFile, handleFilesSelected, handleChangeFile } = useFiles();

  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (selectedFiles.length === 1) {
      const single = files.find((f) => f.name === selectedFiles[0]);
      if (single) handleChangeFile(single);
    }
  }, [selectedFiles, files, handleChangeFile]);

  const filteredFiles = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const [enableViewObserver, setEnableViewObserver] = useState(false);
  useSectionInViewObserver({ headerHeight: 50, enabled: enableViewObserver });
  useEffect(() => {
    setEnableViewObserver(true);
  }, []);

  // const onStart = ({ event, selection }: SelectionEvent) => {
  //   if (!isTouch && !event?.ctrlKey && !event?.metaKey) {
  //     selection.clearSelection();
  //     setSelectedFiles([]);
  //   }
  // };

  // const onMove = ({
  //   store: {
  //     changed: { added, removed },
  //   },
  // }: SelectionEvent) => {
  //   const addedFiles = extractFiles(added, files);
  //   const removedFiles = extractFiles(removed, files);

  //   setSelectedFileIds((prevFileIds) => {
  //     let fileIds = [...prevFileIds];

  //     addedFiles.forEach((file) => {
  //       if (!file) return;
  //       const id = uuid.v4();
  //       if (fileIds.includes(id)) return;
  //       fileIds.push(id);
  //     });

  //     removedFiles.forEach((file) => {
  //       const id = uuid.v4();
  //       fileIds = fileIds.filter((s) => s !== id);
  //     });

  //     return fileIds;
  //   });
  // };

  const [highlightInlineDiff, setHighlightInlineDiff] = useState(true);

  useEffect(() => {
    createHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      engine: createOnigurumaEngine(() => import("shiki/wasm")),
    }).then((loaded) => {
      setHighlighter(loaded as Highlighter);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const [selectedFileIds, setSelectedFileIds] = React.useState<string[]>([]);

  // const router = useRouter();

  // const [actionsOpen, setActionsOpen] = React.useState(false);
  const [isTouch, setIsTouch] = React.useState<boolean>();

  // const handleDownload = React.useCallback(() => {
  //   downloadData(selectedQuicklinks);
  // }, [selectedQuicklinks]);

  // const handleCopyData = React.useCallback(() => {
  //   copyData(selectedQuicklinks);
  //   toast.success("Copied to clipboard!");
  // }, [selectedQuicklinks]);

  // const handleCopyUrl = React.useCallback(async () => {
  //   const url = makeUrl(selectedQuicklinks);
  //   toast.promise(
  //     shortenUrl(url, "quicklinks").then((urlToCopy) => {
  //       if (urlToCopy === null) return null;

  //       copy(urlToCopy);
  //       return "Copied URL to clipboard!";
  //     }),
  //     {
  //       loading: "Copying URL to clipboard...",
  //       success: "Copied URL to clipboard!",
  //       error: "Failed to copy URL to clipboard",
  //     },
  //   );
  // }, [selectedQuicklinks]);

  // const handleAddToRaycast = React.useCallback(
  //   () => addToRaycast(router, selectedQuicklinks),
  //   [router, selectedQuicklinks],
  // );

  React.useEffect(() => {
    setIsTouch(isTouchDevice());
    setEnableViewObserver(true);
  }, [isTouch, setIsTouch, setEnableViewObserver]);

  // React.useEffect(() => {
  //   const down = (event: KeyboardEvent) => {
  //     const { key, keyCode, metaKey, shiftKey, altKey } = event;

  //     if (key === "k" && metaKey) {
  //       if (selectedQuicklinks.length === 0) return;
  //       setActionsOpen((prevOpen) => {
  //         return !prevOpen;
  //       });
  //     }

  //     if (key === "d" && metaKey) {
  //       if (selectedQuicklinks.length === 0) return;
  //       event.preventDefault();
  //       handleDownload();
  //     }

  //     if (key === "Enter" && metaKey) {
  //       if (selectedQuicklinks.length === 0) return;
  //       event.preventDefault();
  //       handleAddToRaycast();
  //     }

  //     // key === "c" doesn't work when using alt key, so we use keCode instead (67)
  //     if (keyCode === 67 && metaKey && altKey) {
  //       if (selectedQuicklinks.length === 0) return;
  //       event.preventDefault();
  //       handleCopyData();
  //       setActionsOpen(false);
  //     }

  //     if (key === "c" && metaKey && shiftKey) {
  //       event.preventDefault();
  //       handleCopyUrl();
  //       setActionsOpen(false);
  //     }
  //   };

  //   document.addEventListener("keydown", down);
  //   return () => document.removeEventListener("keydown", down);
  // }, [setActionsOpen, selectedQuicklinks, handleCopyData, handleDownload, handleCopyUrl, handleAddToRaycast]);

  return (
    <FrameContextStore>
      <NavigationActions>
        <InfoDialog />
        <FormatButton />
        <ExportButton />
      </NavigationActions>

      <div className={styles.main}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <ScrollArea>
              <div
                className={`${styles.sidebarContent} ${!currentFile?.name.endsWith(".patch") ? "justify-between" : ""}`}
              >
                <div className={styles.sidebarNav}>
                  <div className="flex gap-3">
                    <Input
                      type="search"
                      placeholder="Search files…"
                      variant="soft"
                      className="mb-6 flex"
                      size="large"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    >
                      <InputSlot side="left">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                      </InputSlot>
                    </Input>
                    <FileUpload onFilesSelected={handleFilesSelected} />
                  </div>

                  {filteredFiles.length ? <p className={styles.sidebarTitle}>Files</p> : null}

                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredFiles.map((file) => {
                      return (
                        <NavItem
                          key={file.name}
                          file={file}
                          isActive={selectedFiles.includes(file.name)}
                          onSelect={(e) => {
                            e.preventDefault();

                            setSelectedFiles((prev) => {
                              return prev.includes(file.name)
                                ? prev.filter((f) => f !== file.name)
                                : [...prev, file.name];
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {currentFile && currentFile.name.endsWith(".patch") && (
                  <>
                    <span className={styles.sidebarNavDivider}></span>

                    <div className={styles.sidebarNav}>
                      <div className={styles.filter}>
                        <span className={styles.label}>
                          <label htmlFor="inlineDiff">Highlight inline diff</label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info01Icon />
                            </TooltipTrigger>
                            <TooltipContent>If enabled, inline diff will be highlighted in the code</TooltipContent>
                          </Tooltip>
                        </span>
                        <Switch
                          id="inlineDiff"
                          checked={highlightInlineDiff}
                          onCheckedChange={(checked: boolean) => setHighlightInlineDiff(checked)}
                          color="purple"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!(selectedFiles.length > 1) && <Instructions />}

                {selectedFiles.length > 1 && (
                  <div>
                    <p className={styles.sidebarTitle}>Export images</p>

                    <Collapsible.Root>
                      <Collapsible.Trigger asChild>
                        <button className={styles.summaryTrigger}>
                          {selectedFiles.length} {selectedFiles.length > 1 ? "Files" : "File"} selected
                          <ChevronDownIcon />
                        </button>
                      </Collapsible.Trigger>

                      <Collapsible.Content className={styles.summaryContent}>
                        {selectedFiles.map((fn) => (
                          <div key={fn} className={styles.summaryItem}>
                            {fn}
                            <button
                              className={styles.summaryItemButton}
                              onClick={() => {
                                setSelectedFiles((prev) => prev.filter((p) => p !== fn));
                              }}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </Collapsible.Content>
                    </Collapsible.Root>

                    <div className={styles.summaryControls}>
                      <ExportButton />

                      <Button onClick={() => setSelectedFiles([])}>Clear selected</Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className={styles.app}>
          <NoSSR>
            {highlighter && <Frame files={files} handleChangeFile={handleChangeFile} />}
            <Controls />
          </NoSSR>
        </div>
      </div>
    </FrameContextStore>
  );
}

function NavItem({
  file,
  isActive,
  onSelect,
}: {
  file: File;
  isActive: boolean;
  onSelect: (e: React.MouseEvent<HTMLLIElement>) => void;
}) {
  // const activeSection = useSectionInView();

  return (
    <li onClick={onSelect} className={styles.sidebarNavItem} data-active={isActive} data-file-name={file.name}>
      <BlankDocumentIcon />

      <span className={styles.fileName}>{file.name}</span>
      <span className={styles.badge}>0</span>
    </li>
  );
}
