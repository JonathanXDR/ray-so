"use client";

import { Button } from "@/components/button";
import { Input, InputSlot } from "@/components/input";
import { NavigationActions } from "@/components/navigation";
import { ScrollArea } from "@/components/scroll-area";
import { Switch } from "@/components/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { cn } from "@/utils/cn";
import { isTouchDevice } from "@/utils/isTouchDevice";
import useHotkeys from "@/utils/useHotkeys";
import { useSectionInViewObserver } from "@/utils/useSectionInViewObserver";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  BlankDocumentIcon,
  CheckListIcon,
  ChevronDownIcon,
  DeleteDocumentIcon,
  EyeDisabledIcon,
  EyeIcon,
  Info01Icon,
  MagnifyingGlassIcon,
  NewDocumentIcon,
  TrashIcon,
} from "@raycast/icons";
import SelectionArea, { SelectionEvent } from "@viselect/react";
import { useAtom } from "jotai";
import path from "path";
import { useEffect, useState } from "react";
import { getHighlighterCore, Highlighter } from "shiki";
import getWasm from "shiki/wasm";
import tailwindDark from "./assets/tailwind/dark.json";
import tailwindLight from "./assets/tailwind/light.json";
import styles from "./code.module.css";
import Controls from "./components/Controls";
import { DownloadInstructions } from "./components/DownloadInstructions";
import ExportButton from "./components/ExportButton";
import FileUpload from "./components/FileUpload";
import FormatButton from "./components/FormatCodeButton";
import Frame from "./components/Frame";
import { InfoDialog } from "./components/InfoDialog";
import NoSSR from "./components/NoSSR";
import { UploadInstructions } from "./components/UploadInstructions";
import { useFiles, UserFile } from "./hooks/useFiles";
import { fileNameAtom, highlighterAtom } from "./store";
import { codeAtom, selectedLanguageAtom } from "./store/code";
import { derivedFlashMessageAtom, flashShownAtom } from "./store/flash";
import FrameContextStore from "./store/FrameContextStore";
import { shikiTheme } from "./store/themes";
import { LANGUAGES } from "./util/languages";

export function Code() {
  const [highlightInlineDiff, setHighlightInlineDiff] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<UserFile[]>([]);
  const [enableViewObserver, setEnableViewObserver] = useState(false);
  const [isTouch, setIsTouch] = useState<boolean>();
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const [, setFlashMessage] = useAtom(derivedFlashMessageAtom);
  const [, setFlashShown] = useAtom(flashShownAtom);

  const [, setCode] = useAtom(codeAtom);
  const [, setFileName] = useAtom(fileNameAtom);
  const [, setLanguage] = useAtom(selectedLanguageAtom);

  const { files, currentFile, handleFilesSelected, handleChangeFile, removeFile, updateFile, clearAllFiles, hasPatch } =
    useFiles();

  const filteredFiles = files.filter((f) => f.name?.toLowerCase().includes(search.toLowerCase()));

  function selectAll() {
    setFlashMessage({ icon: <CheckListIcon />, message: "Selecting all files" });
    setSelectedFiles(filteredFiles);
    setFlashShown(false);
  }

  useSectionInViewObserver({ headerHeight: 50, enabled: enableViewObserver });

  useEffect(() => {
    setEnableViewObserver(true);
    setIsTouch(isTouchDevice());
  }, []);

  useEffect(() => {
    if (selectedFiles.length === 1) {
      const single = files.find((f) => f.id === selectedFiles[0].id);
      if (single) {
        const fileExtension = path.extname(single.name).slice(1).toLowerCase();
        const language = Object.values(LANGUAGES).find((lang) => lang.extensions?.includes(fileExtension));

        handleChangeFile(single);
        setFileName(single.name);
        setLanguage(language || null);
        setCode(single.content);
      }
    }
  }, [selectedFiles, files, handleChangeFile, setCode, setFileName, setLanguage]);

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      loadWasm: getWasm,
    }).then((loaded) => {
      setHighlighter(loaded as Highlighter);
    });
  }, [setHighlighter]);

  useHotkeys("ctrl+a,cmd+a", (event) => {
    event.preventDefault();
    selectAll();
  });

  function onStart({ event, selection }: SelectionEvent) {
    if (!isTouch && !event?.ctrlKey && !event?.metaKey) {
      selection.clearSelection();
      setSelectedFiles([]);
    }
  }
  function onMove({
    store: {
      changed: { added, removed },
    },
  }: SelectionEvent) {
    setSelectedFiles((prevFiles) => {
      let newSelected = [...prevFiles];

      added.forEach((elem) => {
        const fileId = elem?.getAttribute?.("data-file-id");
        if (!fileId) return;
        const f = files.find((fi) => fi.id === fileId);
        if (f && !newSelected.find((x) => x.id === f.id)) {
          newSelected.push(f);
        }
      });

      removed.forEach((elem) => {
        const fileId = elem?.getAttribute?.("data-file-id");
        if (!fileId) return;
        newSelected = newSelected.filter((x) => x.id !== fileId);
      });

      return newSelected;
    });
  }

  function handleNavItemClick(e: React.MouseEvent, file: UserFile) {
    e.preventDefault();

    if (e.metaKey || e.ctrlKey) {
      setSelectedFiles((prev) => {
        const isAlready = prev.some((f) => f.id === file.id);
        if (isAlready) {
          return prev.filter((f) => f.id !== file.id);
        } else {
          return [...prev, file];
        }
      });
    } else {
      setSelectedFiles([file]);
    }
  }

  return (
    <FrameContextStore>
      <NavigationActions>
        <InfoDialog />
        <FormatButton />
        {/* Pass the selectedFiles to ExportButton so it can handle bulk exports */}
        <ExportButton selectedFiles={selectedFiles} />
      </NavigationActions>

      <div className={styles.main}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <ScrollArea>
              <div className={cn(styles.sidebarContent, !hasPatch && "justify-between")}>
                <div className={styles.sidebarNav}>
                  <div className="flex gap-3 mb-6">
                    <Input
                      type="search"
                      placeholder="Search files…"
                      variant="soft"
                      className="flex"
                      size="large"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    >
                      <InputSlot side="left">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                      </InputSlot>
                    </Input>

                    <FileUpload
                      files={files}
                      onFilesSelected={handleFilesSelected}
                      onClearAll={() => {
                        setSelectedFiles([]);
                        clearAllFiles();
                      }}
                    />
                  </div>

                  {filteredFiles.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                      <p className={styles.sidebarTitle}>Files</p>
                      {files.length > 1 && (
                        <Button
                          onClick={() => {
                            const hasSelected = selectedFiles.length > 1;
                            setSelectedFiles(hasSelected ? [] : filteredFiles);
                          }}
                        >
                          {selectedFiles.length > 1 ? (
                            <>
                              <EyeDisabledIcon />
                              Clear selected
                            </>
                          ) : (
                            <>
                              <EyeIcon />
                              Select all
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {filteredFiles.length > 0 && (
                    <div className={styles.selectableContainer}>
                      {isTouch !== null && (
                        <SelectionArea
                          onStart={onStart}
                          onMove={onMove}
                          selectables=".selectable"
                          features={{
                            touch: isTouch ? false : true,
                            range: true,
                            singleTap: {
                              allow: true,
                              intersect: "native",
                            },
                          }}
                        >
                          {filteredFiles.map((file) => {
                            const isSelected = selectedFiles.some((sf) => sf.id === file.id);
                            return (
                              <NavItem
                                key={file.id}
                                file={file}
                                isSelected={isSelected}
                                onClick={(e) => handleNavItemClick(e, file)}
                              />
                            );
                          })}
                        </SelectionArea>
                      )}
                    </div>
                  )}
                </div>

                {hasPatch && (
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
                          onCheckedChange={(checked) => setHighlightInlineDiff(checked)}
                          color="purple"
                        />
                      </div>
                    </div>
                  </>
                )}

                {files.length < 1 && <UploadInstructions />}
                {files.length > 0 && !(selectedFiles.length > 1) && <DownloadInstructions />}

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
                        {selectedFiles.map((file, index) => (
                          <div key={file.id} className={styles.summaryItem}>
                            <p className="truncate max-w-[190px]">{file.name}</p>
                            <button
                              className={styles.summaryItemButton}
                              onClick={() => {
                                setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id));
                              }}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </Collapsible.Content>
                    </Collapsible.Root>

                    <div className={styles.summaryControls}>
                      <ExportButton selectedFiles={selectedFiles} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className={styles.app}>
          <NoSSR>
            {highlighter && (
              <Frame
                files={files}
                currentFile={currentFile}
                code={currentFile?.content}
                handleChangeFile={(file) => {
                  handleChangeFile(file);
                  setCode(file.content);
                  setFileName(file.name);
                }}
                // Pass the selected files to show BulkEditPlaceholder if multi
                selectedFiles={selectedFiles}
              />
            )}
            <Controls files={files} selectedFiles={selectedFiles} />
          </NoSSR>
        </div>
      </div>
    </FrameContextStore>
  );
}

type NavItemProps = {
  file: UserFile;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
};
function NavItem({ file, isSelected, onClick }: NavItemProps) {
  return (
    <div
      className={cn("selectable", styles.sidebarNavItem)}
      data-file-id={file.id}
      data-active={isSelected ? "true" : undefined}
      onClick={onClick}
    >
      {file.type === "add" && <NewDocumentIcon className="min-w-4" />}
      {file.type === "delete" && <DeleteDocumentIcon className="min-w-4" />}
      {file.type !== "add" && file.type !== "delete" && <BlankDocumentIcon className="min-w-4" />}

      <span
        className={cn(styles.fileName, {
          "max-w-[120px]": file.hunks && file.type,
          "max-w-[190px]": !file.hunks || !file.type,
        })}
      >
        {file.name}
      </span>

      {file.hunks && file.type && (
        <span
          className={cn(styles.badge, {
            "text-green bg-green/15": file.type === "add",
            "text-red bg-red/15": file.type === "delete",
            "text-blue bg-blue/15": file.type !== "add" && file.type !== "delete",
          })}
        >
          {file.type === "add" && "+"}
          {file.type === "delete" && "-"}
          {file.type !== "add" && file.type !== "delete" && "~"}
          {file.hunks.map((h) => h.changes.length).reduce((a, b) => a + b, 0)}
        </span>
      )}
    </div>
  );
}
