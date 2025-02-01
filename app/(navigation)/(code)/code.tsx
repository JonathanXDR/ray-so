"use client";
import { Button } from "@/components/button";
import { Input, InputSlot } from "@/components/input";
import { NavigationActions } from "@/components/navigation";
import { ScrollArea } from "@/components/scroll-area";
import { Switch } from "@/components/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { useSectionInView, useSectionInViewObserver } from "@/utils/useSectionInViewObserver";
import * as Collapsible from "@radix-ui/react-collapsible";
import { BlankDocumentIcon, ChevronDownIcon, Info01Icon, MagnifyingGlassIcon, TrashIcon } from "@raycast/icons";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { getHighlighterCore, Highlighter } from "shiki";
import getWasm from "shiki/wasm";
import tailwindDark from "./assets/tailwind/dark.json";
import tailwindLight from "./assets/tailwind/light.json";
import styles from "./code.module.css";
import Controls from "./components/Controls";
import ExportButton from "./components/ExportButton";
import FormatButton from "./components/FormatCodeButton";
import Frame from "./components/Frame";
import { InfoDialog } from "./components/InfoDialog";
import { Instructions } from "./components/Instructions";
import NoSSR from "./components/NoSSR";
import PatchUploader from "./components/PatchUploader";
import { usePatchFiles } from "./hooks/usePatchFiles";
import { PatchFile } from "./lib/types";
import { highlighterAtom } from "./store";
import FrameContextStore from "./store/FrameContextStore";
import { shikiTheme } from "./store/themes";
import { LANGUAGES } from "./util/languages";

function extractFiles(elements: Element[], files: PatchFile[]): PatchFile[] {
  const result: PatchFile[] = [];
  for (const el of elements) {
    const fileName = el.getAttribute("data-file-name");
    if (!fileName) continue;
    const found = files.find((f) => f.fileName === fileName);
    if (found) result.push(found);
  }
  return result;
}

export function Code() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const { patchFiles, currentPatch, handleFilesSelected, handleChangeFile } = usePatchFiles();

  const [search, setSearch] = useState("");
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);

  useEffect(() => {
    if (selectedFileNames.length === 1) {
      const single = patchFiles.find((f) => f.fileName === selectedFileNames[0]);
      if (single) handleChangeFile(single);
    }
  }, [selectedFileNames, patchFiles, handleChangeFile]);

  const filteredFiles = patchFiles.filter((f) => f.fileName.toLowerCase().includes(search.toLowerCase()));

  const [enableViewObserver, setEnableViewObserver] = useState(false);
  useSectionInViewObserver({ headerHeight: 50, enabled: enableViewObserver });
  useEffect(() => {
    setEnableViewObserver(true);
  }, []);

  const onStart = () => {};
  const onMove = ({
    store: {
      changed: { added, removed },
    },
  }: any) => {
    const addedFiles = extractFiles(added, patchFiles);
    const removedFiles = extractFiles(removed, patchFiles);

    setSelectedFileNames((prev) => {
      let next = [...prev];
      for (const file of addedFiles) {
        if (!next.includes(file.fileName)) next.push(file.fileName);
      }
      for (const file of removedFiles) {
        next = next.filter((fn) => fn !== file.fileName);
      }
      return next;
    });
  };

  const [highlightInlineDiff, setHighlightInlineDiff] = useState(true);

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      loadWasm: getWasm,
    }).then((loaded) => {
      setHighlighter(loaded as Highlighter);
    });
  }, []);

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
                className={`${styles.sidebarContent} ${!currentPatch?.fileName.endsWith(".patch") ? "justify-between" : ""}`}
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
                    <PatchUploader onFilesSelected={handleFilesSelected} />
                  </div>

                  {filteredFiles.length ? <p className={styles.sidebarTitle}>Files</p> : null}

                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredFiles.map((file) => {
                      return (
                        <NavItem
                          key={file.fileName}
                          file={file}
                          isActive={selectedFileNames.includes(file.fileName)}
                          onSelect={(e) => {
                            e.preventDefault();

                            setSelectedFileNames((prev) => {
                              return prev.includes(file.fileName)
                                ? prev.filter((f) => f !== file.fileName)
                                : [...prev, file.fileName];
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {currentPatch && currentPatch.fileName.endsWith(".patch") && (
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

                {!(selectedFileNames.length > 1) && <Instructions />}

                {selectedFileNames.length > 1 && (
                  <div>
                    <p className={styles.sidebarTitle}>Export images</p>

                    <Collapsible.Root>
                      <Collapsible.Trigger asChild>
                        <button className={styles.summaryTrigger}>
                          {selectedFileNames.length} {selectedFileNames.length > 1 ? "Files" : "File"} selected
                          <ChevronDownIcon />
                        </button>
                      </Collapsible.Trigger>

                      <Collapsible.Content className={styles.summaryContent}>
                        {selectedFileNames.map((fn) => (
                          <div key={fn} className={styles.summaryItem}>
                            {fn}
                            <button
                              className={styles.summaryItemButton}
                              onClick={() => {
                                setSelectedFileNames((prev) => prev.filter((p) => p !== fn));
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

                      <Button onClick={() => setSelectedFileNames([])}>Clear selected</Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className={styles.app}>
          <NoSSR>
            {highlighter && <Frame />}
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
  file: PatchFile;
  isActive: boolean;
  onSelect: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const activeSection = useSectionInView();

  return (
    <a
      href="#"
      onClick={onSelect}
      className={styles.sidebarNavItem}
      data-active={isActive}
      data-file-name={file.fileName}
    >
      <BlankDocumentIcon />

      <span className={styles.fileName}>{file.fileName}</span>
      <span className={styles.badge}>0</span>
    </a>
  );
}
