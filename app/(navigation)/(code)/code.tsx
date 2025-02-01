"use client";
import { useAtom } from "jotai";
import { useEffect } from "react";
import getWasm from "shiki/wasm";
import { highlighterAtom } from "./store";

import { shikiTheme } from "./store/themes";

import Controls from "./components/Controls";
import Frame from "./components/Frame";
import PatchUploader from "./components/PatchUploader";
import FrameContextStore from "./store/FrameContextStore";

import styles from "./code.module.css";
import NoSSR from "./components/NoSSR";

import { Highlighter, getHighlighterCore } from "shiki";
import { LANGUAGES } from "./util/languages";

import { NavigationActions } from "@/components/navigation";
import tailwindDark from "./assets/tailwind/dark.json";
import tailwindLight from "./assets/tailwind/light.json";
import ExportButton from "./components/ExportButton";
import FormatButton from "./components/FormatCodeButton";
import { InfoDialog } from "./components/InfoDialog";

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

  return (
    <>
      <FrameContextStore>
        <NavigationActions>
          <InfoDialog />
          <FormatButton />
          <ExportButton />
        </NavigationActions>
        <div className={styles.app}>
          <NoSSR>
            {highlighter && <Frame />}
            <Controls />
            <div className="absolute top-[100px] right-5 w-[300px] bg-gray-2 p-4 rounded shadow">
              <PatchUploader />
            </div>
          </NoSSR>
        </div>
      </FrameContextStore>
    </>
  );
}
