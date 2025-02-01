"use client";
import { Button } from "@/components/button";
import { NavigationActions } from "@/components/navigation";
import { ScrollArea } from "@/components/scroll-area";
import { useSectionInView, useSectionInViewObserver } from "@/utils/useSectionInViewObserver";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDownIcon, StarsIcon, TrashIcon } from "@raycast/icons";
import { SelectionEvent } from "@viselect/react";
import copy from "copy-to-clipboard";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { getHighlighterCore, Highlighter } from "shiki";
import getWasm from "shiki/wasm";
import { categories, Category, Prompt } from "../prompts/prompts";
import { addToRaycast, copyData, downloadData, makeUrl } from "../prompts/utils/actions";
import { extractPrompts } from "../prompts/utils/extractPrompts";
import { isTouchDevice } from "../prompts/utils/isTouchDevice";
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
import { highlighterAtom } from "./store";
import FrameContextStore from "./store/FrameContextStore";
import { shikiTheme } from "./store/themes";
import { LANGUAGES } from "./util/languages";

export function Code() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      loadWasm: getWasm,
    }).then((highlighter) => {
      setHighlighter(highlighter as Highlighter);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Stuff from prompts
  const [enableViewObserver, setEnableViewObserver] = React.useState(false);
  useSectionInViewObserver({ headerHeight: 50, enabled: enableViewObserver });

  const router = useRouter();

  const [selectedPrompts, setSelectedPrompts] = React.useState<Prompt[]>([]);

  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");

  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [isTouch, setIsTouch] = React.useState<boolean>();

  const onStart = ({ event, selection }: SelectionEvent) => {
    if (!isTouch && !event?.ctrlKey && !event?.metaKey) {
      selection.clearSelection();
      setSelectedPrompts([]);
    }
  };

  const onMove = ({
    store: {
      changed: { added, removed },
    },
  }: SelectionEvent) => {
    const addedPrompts = extractPrompts(added, categories);
    const removedPrompts = extractPrompts(removed, categories);

    setSelectedPrompts((prevPrompts) => {
      const prompts = [...prevPrompts];

      addedPrompts.forEach((prompt) => {
        if (!prompt) {
          return;
        }
        if (prompts.find((p) => p.id === prompt.id)) {
          return;
        }
        prompts.push(prompt);
      });

      removedPrompts.forEach((prompt) => {
        return prompts.filter((s) => s?.id !== prompt?.id);
      });

      return prompts;
    });
  };

  const handleDownload = React.useCallback(() => {
    downloadData(selectedPrompts);
  }, [selectedPrompts]);

  const handleCopyData = React.useCallback(() => {
    copyData(selectedPrompts);
    setToastMessage("Copied to clipboard");
    setShowToast(true);
  }, [selectedPrompts]);

  const handleCopyUrl = React.useCallback(async () => {
    setToastMessage("Copying URL to clipboard...");
    setShowToast(true);

    const url = makeUrl(selectedPrompts);
    let urlToCopy = url;
    const encodedUrl = encodeURIComponent(urlToCopy);
    const response = await fetch(`https://ray.so/api/shorten-url?url=${encodedUrl}&ref=prompts`).then((res) =>
      res.json(),
    );

    if (response.link) {
      urlToCopy = response.link;
    }

    copy(urlToCopy);
    setShowToast(true);
    setToastMessage("Copied URL to clipboard!");
  }, [selectedPrompts]);

  const handleCopyText = React.useCallback((prompt: Prompt) => {
    copy(prompt.prompt);
    setShowToast(true);
    setToastMessage("Copied to clipboard");
  }, []);

  const handleAddToRaycast = React.useCallback(() => addToRaycast(router, selectedPrompts), [router, selectedPrompts]);

  React.useEffect(() => {
    setIsTouch(isTouchDevice());
    setEnableViewObserver(true);
  }, [isTouch, setIsTouch, setEnableViewObserver]);

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const { key, keyCode, metaKey, shiftKey, altKey } = event;

      if (key === "k" && metaKey) {
        if (selectedPrompts.length === 0) return;
        setActionsOpen((prevOpen) => {
          return !prevOpen;
        });
      }

      if (key === "d" && metaKey) {
        if (selectedPrompts.length === 0) return;
        event.preventDefault();
        handleDownload();
      }

      if (key === "Enter" && metaKey) {
        if (selectedPrompts.length === 0) return;
        event.preventDefault();
        handleAddToRaycast();
      }

      // key === "c" doesn't work when using alt key, so we use keCode instead (67)
      if (keyCode === 67 && metaKey && altKey) {
        if (selectedPrompts.length === 0) return;
        event.preventDefault();
        handleCopyData();
        setActionsOpen(false);
      }

      if (key === "c" && metaKey && shiftKey) {
        event.preventDefault();
        handleCopyUrl();
        setActionsOpen(false);
      }

      if (key === "a" && metaKey) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setActionsOpen, selectedPrompts, handleCopyData, handleDownload, handleCopyUrl, handleAddToRaycast]);

  React.useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  }, [showToast]);

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
              <div className={styles.sidebarContent}>
                <div className={styles.sidebarNav}>
                  <p className={styles.sidebarTitle}>Categories</p>

                  {categories.map((category) => (
                    <NavItem key={category.slug} category={category} />
                  ))}
                </div>

                {selectedPrompts.length === 0 && <Instructions />}

                {selectedPrompts.length > 0 && (
                  <div>
                    <p className={styles.sidebarTitle}>Add to Raycast</p>

                    <Collapsible.Root>
                      <Collapsible.Trigger asChild>
                        <button className={styles.summaryTrigger}>
                          {selectedPrompts.length} {selectedPrompts.length > 1 ? "Prompts" : "Prompt"} selected
                          <ChevronDownIcon />
                        </button>
                      </Collapsible.Trigger>

                      <Collapsible.Content className={styles.summaryContent}>
                        {selectedPrompts.map((prompt, index) => (
                          <div key={prompt.title + index} className={styles.summaryItem}>
                            {prompt.title}
                            <button
                              className={styles.summaryItemButton}
                              onClick={() => {
                                setSelectedPrompts(
                                  selectedPrompts.filter((selectedPrompt) => selectedPrompt.id !== prompt.id),
                                );
                              }}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </Collapsible.Content>
                    </Collapsible.Root>

                    <div className={styles.summaryControls}>
                      <Button onClick={handleAddToRaycast} variant="primary">
                        Add to Raycast
                      </Button>

                      <Button onClick={() => setSelectedPrompts([])}>Clear selected</Button>
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

function NavItem({ category }: { category: Category }) {
  const activeSection = useSectionInView();

  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState(null, "", `/prompts${category.slug}`);
      }}
      className={styles.sidebarNavItem}
      data-active={activeSection === `/prompts${category.slug}`}
    >
      {category.icon ? <category.iconComponent /> : <StarsIcon />}

      {category.name}
      <span className={styles.badge}>{category.prompts.length}</span>
    </a>
  );
}
