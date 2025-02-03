"use client";
import { Button } from "@/components/button";
import { Input, InputSlot } from "@/components/input";
import { NavigationActions } from "@/components/navigation";
import { ScrollArea } from "@/components/scroll-area";
import { Switch } from "@/components/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { cn } from "@/utils/cn";
import useHotkeys from "@/utils/useHotkeys";
import { useSectionInView, useSectionInViewObserver } from "@/utils/useSectionInViewObserver";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  BlankDocumentIcon,
  CheckListIcon,
  ChevronDownIcon,
  EyeDisabledIcon,
  EyeIcon,
  Info01Icon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@raycast/icons";
import { useAtom } from "jotai";
import path from "path";
import { useEffect, useState } from "react";
import { getHighlighterCore, Highlighter } from "shiki";
import getWasm from "shiki/wasm";
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
import { derivedFlashMessageAtom, flashShownAtom } from "./store/flash";
import FrameContextStore from "./store/FrameContextStore";
import { shikiTheme } from "./store/themes";
import { isTouchDevice } from "./util/isTouchDevice";
import { LANGUAGES } from "./util/languages";

export function Code() {
  const [highlightInlineDiff, setHighlightInlineDiff] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [enableViewObserver, setEnableViewObserver] = useState(false);
  const [isTouch, setIsTouch] = useState<boolean>();
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const [, setFlashMessage] = useAtom(derivedFlashMessageAtom);
  const [, setFlashShown] = useAtom(flashShownAtom);

  const { files, currentFile, handleFilesSelected, handleChangeFile, removeFile, updateFile } = useFiles();
  const fileExtension = currentFile?.name ? path.extname(currentFile.name).slice(1) : undefined;
  const filteredFiles = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (selectedFiles.length === 1) {
      const single = files.find((f) => f.name === selectedFiles[0]?.name);
      if (single) handleChangeFile(single);
    }
  }, [selectedFiles, files, handleChangeFile]);

  useSectionInViewObserver({ headerHeight: 50, enabled: enableViewObserver });
  useEffect(() => {
    setEnableViewObserver(true);
  }, []);

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      loadWasm: getWasm,
    }).then((loaded) => {
      setHighlighter(loaded as Highlighter);
    });
  }, []);

  useEffect(() => {
    setIsTouch(isTouchDevice());
    setEnableViewObserver(true);
  }, [isTouch, setIsTouch, setEnableViewObserver]);

  const selectAll = async () => {
    setFlashMessage({ icon: <CheckListIcon />, message: "Selecting all files" });
    setSelectedFiles(filteredFiles);
    setFlashShown(false);
  };

  useHotkeys("ctrl+a,cmd+a", (event) => {
    event.preventDefault();
    selectAll();
  });

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
              <div className={cn(styles.sidebarContent, fileExtension !== "patch" && "justify-between")}>
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
                    <FileUpload files={files} onFilesSelected={handleFilesSelected} />
                  </div>

                  {filteredFiles.length ? (
                    <div className="flex justify-between items-center mb-4">
                      <p className={styles.sidebarTitle}>Files</p>
                      <Button
                        onClick={() => {
                          const hasSelected = selectedFiles.length > 0;
                          setSelectedFiles(hasSelected ? [] : filteredFiles);
                        }}
                      >
                        {selectedFiles.length > 0 ? (
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
                    </div>
                  ) : null}

                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredFiles.map((file, index) => {
                      const isSelected = selectedFiles.some((selectedFile) => selectedFile.name === file.name);
                      return <NavItem key={index} file={file} data-selected={isSelected} />;
                    })}
                  </div>
                </div>

                {fileExtension === "patch" && (
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
                        {selectedFiles.map((file, index) => (
                          <div key={index} className={styles.summaryItem}>
                            {file.name}
                            <button
                              className={styles.summaryItemButton}
                              onClick={() => {
                                setSelectedFiles((prev) => prev.filter((f) => f !== file));
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

                      {/* <Button onClick={() => setSelectedFiles([])}>Clear selected</Button> */}
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

async function NavItem({ file }: { file: File }) {
  const activeSection = useSectionInView();
  const fileExtension = path.extname(file.name).slice(1);

  if (!fileExtension || !LANGUAGES[fileExtension]) {
    return null;
  }

  const content = await file.text();

  const params = new URLSearchParams();
  params.set("title", file.name);
  if (fileExtension) {
    params.set("language", fileExtension);
  }
  if (content) {
    params.set("code", content);
  }

  return (
    <a
      onClick={(e) => {
        e.preventDefault();

        window.history.pushState(null, "", `#${params.toString()}`);
      }}
      className={styles.sidebarNavItem}
      data-active={activeSection === `#${params.toString()}`}
    >
      <BlankDocumentIcon />

      <span className={styles.fileName}>{file.name}</span>
      <span className={styles.badge}>0</span>
    </a>
  );
}
