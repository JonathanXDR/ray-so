"use client";
import { getRaycastFlavor } from "@/app/RaycastFlavor";
import { Button } from "@/components/button";
import { Input, InputSlot } from "@/components/input";
import { NavigationActions } from "@/components/navigation";
import { ScrollArea } from "@/components/scroll-area";
import { Switch } from "@/components/switch";
import { toast } from "@/components/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { shortenUrl } from "@/utils/common";
import { useSectionInView, useSectionInViewObserver } from "@/utils/useSectionInViewObserver";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDownIcon, Info01Icon, MagnifyingGlassIcon, StarsIcon, TrashIcon } from "@raycast/icons";
import { SelectionEvent } from "@viselect/react";
import copy from "copy-to-clipboard";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { getHighlighterCore, Highlighter } from "shiki";
import getWasm from "shiki/wasm";
import { Category, categories as originalCategories, Quicklink } from "../quicklinks/quicklinks";
import { addToRaycast, copyData, downloadData, makeUrl } from "../quicklinks/utils/actions";
import { extractQuicklinks } from "../quicklinks/utils/extractQuicklinks";
import { isTouchDevice } from "../quicklinks/utils/isTouchDevice";
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
import { highlighterAtom } from "./store";
import FrameContextStore from "./store/FrameContextStore";
import { shikiTheme } from "./store/themes";
import { LANGUAGES } from "./util/languages";

export function Code() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const { patchFiles, currentPatch, handleFilesSelected, handleChangeFile } = usePatchFiles();

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      loadWasm: getWasm,
    }).then((highlighter) => {
      setHighlighter(highlighter as Highlighter);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Stuff from quicklinks
  const [enableViewObserver, setEnableViewObserver] = React.useState(false);
  useSectionInViewObserver({ headerHeight: 50, enabled: enableViewObserver });
  const [search, setSearch] = React.useState("");

  const [categories, setCategories] = React.useState<Category[]>(originalCategories);
  // The current flavor of Raycast is saved in localStorage,
  // so we need to convert all links on the client to not get hydration errors
  const raycastProtocol = getRaycastFlavor();
  useEffect(() => {
    const flavoredCategories = originalCategories.map((category) => {
      return {
        ...category,
        quicklinks: category.quicklinks.map((quicklink) => {
          return {
            ...quicklink,
            link: quicklink.link
              .replace("raycast://", `${raycastProtocol}://`)
              .replace("raycastinternal://", `${raycastProtocol}://`),
          };
        }),
      };
    });
    setCategories(flavoredCategories);
  }, [raycastProtocol]);

  const updateQuicklink = (updatedQuicklink: Quicklink) => {
    const updatedCategories = categories.map((category) => {
      const updatedQuicklinks = category.quicklinks.map((quicklink) => {
        if (quicklink.id === updatedQuicklink.id) {
          return updatedQuicklink;
        }
        return quicklink;
      });

      return {
        ...category,
        quicklinks: updatedQuicklinks,
      };
    });

    setCategories(updatedCategories);
  };

  const filteredQuicklinks = categories.flatMap((category) => {
    return category.quicklinks.filter((quicklink) => quicklink.name.toLowerCase().includes(search.toLowerCase()));
  });

  const [selectedQuicklinkIds, setSelectedQuicklinkIds] = React.useState<string[]>([]);

  const router = useRouter();
  const selectedQuicklinks = categories.flatMap((category) => {
    return category.quicklinks.filter((quicklink) => selectedQuicklinkIds.includes(quicklink.id));
  });

  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [isTouch, setIsTouch] = React.useState<boolean>();

  const onStart = ({ event, selection }: SelectionEvent) => {
    if (!isTouch && !event?.ctrlKey && !event?.metaKey) {
      selection.clearSelection();
      setSelectedQuicklinkIds([]);
    }
  };

  const onMove = ({
    store: {
      changed: { added, removed },
    },
  }: SelectionEvent) => {
    const addedQuicklinks = extractQuicklinks(added, categories);
    const removedQuicklinks = extractQuicklinks(removed, categories);

    setSelectedQuicklinkIds((prevQuicklinkIds) => {
      let quicklinkIds = [...prevQuicklinkIds];

      addedQuicklinks.forEach((quicklink) => {
        if (!quicklink) {
          return;
        }
        if (quicklinkIds.includes(quicklink.id)) {
          return;
        }
        quicklinkIds.push(quicklink.id);
      });

      removedQuicklinks.forEach((quicklink) => {
        quicklinkIds = quicklinkIds.filter((s) => s !== quicklink?.id);
      });

      return quicklinkIds;
    });
  };

  const handleDownload = React.useCallback(() => {
    downloadData(selectedQuicklinks);
  }, [selectedQuicklinks]);

  const handleCopyData = React.useCallback(() => {
    copyData(selectedQuicklinks);
    toast.success("Copied to clipboard!");
  }, [selectedQuicklinks]);

  const handleCopyUrl = React.useCallback(async () => {
    const url = makeUrl(selectedQuicklinks);
    toast.promise(
      shortenUrl(url, "quicklinks").then((urlToCopy) => {
        if (urlToCopy === null) return null;

        copy(urlToCopy);
        return "Copied URL to clipboard!";
      }),
      {
        loading: "Copying URL to clipboard...",
        success: "Copied URL to clipboard!",
        error: "Failed to copy URL to clipboard",
      },
    );
  }, [selectedQuicklinks]);

  const handleAddToRaycast = React.useCallback(
    () => addToRaycast(router, selectedQuicklinks),
    [router, selectedQuicklinks],
  );

  React.useEffect(() => {
    setIsTouch(isTouchDevice());
    setEnableViewObserver(true);
  }, [isTouch, setIsTouch, setEnableViewObserver]);

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const { key, keyCode, metaKey, shiftKey, altKey } = event;

      if (key === "k" && metaKey) {
        if (selectedQuicklinks.length === 0) return;
        setActionsOpen((prevOpen) => {
          return !prevOpen;
        });
      }

      if (key === "d" && metaKey) {
        if (selectedQuicklinks.length === 0) return;
        event.preventDefault();
        handleDownload();
      }

      if (key === "Enter" && metaKey) {
        if (selectedQuicklinks.length === 0) return;
        event.preventDefault();
        handleAddToRaycast();
      }

      // key === "c" doesn't work when using alt key, so we use keCode instead (67)
      if (keyCode === 67 && metaKey && altKey) {
        if (selectedQuicklinks.length === 0) return;
        event.preventDefault();
        handleCopyData();
        setActionsOpen(false);
      }

      if (key === "c" && metaKey && shiftKey) {
        event.preventDefault();
        handleCopyUrl();
        setActionsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setActionsOpen, selectedQuicklinks, handleCopyData, handleDownload, handleCopyUrl, handleAddToRaycast]);

  const [showAdvancedModels, setShowAdvancedModels] = React.useState(true);

  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    return c.quicklinks.some((q) => q.name.toLowerCase().includes(search.toLowerCase()));
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
              <div className={styles.sidebarContent}>
                <div className={styles.sidebarNav}>
                  <PatchUploader onFilesSelected={handleFilesSelected} />
                  <Input
                    type="search"
                    placeholder="Search quicklinks…"
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
                  {filteredCategories.length ? <p className={styles.sidebarTitle}>Categories</p> : null}

                  {filteredCategories.map((category) => {
                    const categoryWithFilteredQuicklinks = {
                      ...category,
                      quicklinks: category.quicklinks.filter((q) =>
                        q.name.toLowerCase().includes(search.toLowerCase()),
                      ),
                    };

                    return <NavItem key={category.slug} category={categoryWithFilteredQuicklinks} />;
                  })}
                </div>
                <span className={styles.sidebarNavDivider}></span>
                <div className={styles.sidebarNav}>
                  <div className={styles.filter}>
                    <span className={styles.label}>
                      <label htmlFor="advancedModels">Show Advanced AI Models</label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info01Icon />
                        </TooltipTrigger>
                        <TooltipContent>Requires Advanced AI add-on to Raycast Pro</TooltipContent>
                      </Tooltip>
                    </span>

                    <Switch
                      id="advancedModels"
                      checked={showAdvancedModels}
                      onCheckedChange={(checked) => setShowAdvancedModels(checked)}
                      color="purple"
                    />
                  </div>
                </div>

                {selectedQuicklinks.length === 0 && <Instructions />}

                {selectedQuicklinks.length > 0 && (
                  <div>
                    <p className={styles.sidebarTitle}>Add to Raycast</p>

                    <Collapsible.Root>
                      <Collapsible.Trigger asChild>
                        <button className={styles.summaryTrigger}>
                          {selectedQuicklinks.length} {selectedQuicklinks.length > 1 ? "Quicklinks" : "Quicklink"}{" "}
                          selected
                          <ChevronDownIcon />
                        </button>
                      </Collapsible.Trigger>

                      <Collapsible.Content className={styles.summaryContent}>
                        {selectedQuicklinks.map((quicklink, index) => (
                          <div key={quicklink.id} className={styles.summaryItem}>
                            {quicklink.name}
                            <button
                              className={styles.summaryItemButton}
                              onClick={() => {
                                setSelectedQuicklinkIds(
                                  selectedQuicklinkIds.filter(
                                    (selectedQuicklinkId) => selectedQuicklinkId !== quicklink.id,
                                  ),
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

                      <Button onClick={() => setSelectedQuicklinkIds([])}>Clear selected</Button>
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
        window.history.pushState(null, "", `/quicklinks${category.slug}`);
      }}
      className={styles.sidebarNavItem}
      data-active={activeSection === `/quicklinks${category.slug}`}
    >
      {category.icon ? <category.iconComponent /> : <StarsIcon />}

      {category.name}
      <span className={styles.badge}>{category.quicklinks.length}</span>
    </a>
  );
}
