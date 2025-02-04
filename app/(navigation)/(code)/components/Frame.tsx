import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { RefObject, useContext, useEffect } from "react";
import clerkPattern from "../assets/clerk/pattern.svg?url";
import mintlifyPatternDark from "../assets/mintlify-pattern-dark.svg?url";
import mintlifyPatternLight from "../assets/mintlify-pattern-light.svg?url";
import beams from "../assets/tailwind/beams.png";
import { UserFile } from "../hooks/useFiles";
import { fileNameAtom, showBackgroundAtom } from "../store";
import { codeAtom, selectedLanguageAtom } from "../store/code";
import { FrameContext } from "../store/FrameContextStore";
import { paddingAtom } from "../store/padding";
import { darkModeAtom, themeAtom, themeBackgroundAtom, themeCSSAtom, themeFontAtom, THEMES } from "../store/themes";
import useIsSafari from "../util/useIsSafari";
import BulkEditPlaceholder from "./BulkEditPlaceholder";
import Editor from "./Editor";
import FlashMessage from "./FlashMessage";
import styles from "./Frame.module.css";
import ResizableFrame from "./ResizableFrame";

interface EphemeralProps {
  ephemeralDarkMode?: boolean;
  ephemeralTheme?: any;
  ephemeralBackground?: boolean;
  ephemeralPadding?: number;
  ephemeralLineNumbers?: boolean;
  ephemeralLanguage?: any;
  ephemeralFileName?: string;
  ephemeralCode?: string;
  ephemeralRef?: RefObject<HTMLDivElement>;
}

interface FrameProps extends EphemeralProps {
  resize?: boolean;
  code?: string;
  files: UserFile[];
  currentFile?: UserFile | null;
  handleChangeFile: (file: UserFile) => void;
  selectedFiles: UserFile[];
}

const VercelFrame = () => {
  const [darkMode] = useAtom(darkModeAtom);
  const [padding] = useAtom(paddingAtom);
  const [showBackground] = useAtom(showBackgroundAtom);

  return (
    <div
      className={classNames(
        styles.frame,
        showBackground && styles.vercelFrame,
        showBackground && !darkMode && styles.vercelFrameLightMode,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      <div className={styles.vercelWindow}>
        <span className={styles.vercelGridlinesHorizontal} data-grid></span>
        <span className={styles.vercelGridlinesVertical} data-grid></span>
        <span className={styles.vercelBracketLeft} data-grid></span>
        <span className={styles.vercelBracketRight} data-grid></span>
        <Editor />
      </div>
    </div>
  );
};

const SupabaseFrame = () => {
  const [darkMode] = useAtom(darkModeAtom);
  const [padding] = useAtom(paddingAtom);
  const [showBackground] = useAtom(showBackgroundAtom);
  const [fileName, setFileName] = useAtom(fileNameAtom);
  const [selectedLanguage] = useAtom(selectedLanguageAtom);

  return (
    <div
      className={classNames(
        styles.frame,
        showBackground && styles.supabaseFrame,
        !darkMode && styles.supabaseFrameLightMode,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      <div className={styles.supabaseWindow}>
        <div className={styles.supabaseHeader}>
          <div className={classNames(styles.fileName, styles.supabaseFileName)} data-value={fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              spellCheck={false}
              tabIndex={-1}
              size={1}
            />
            {fileName.length === 0 ? <span>Untitled-1</span> : null}
          </div>
          <span className={styles.supabaseLanguage}>{selectedLanguage?.name}</span>
        </div>
        <Editor />
      </div>
    </div>
  );
};

const TailwindFrame = () => {
  const [darkMode] = useAtom(darkModeAtom);
  const [padding] = useAtom(paddingAtom);
  const [showBackground] = useAtom(showBackgroundAtom);
  const isSafari = useIsSafari();

  return (
    <div
      className={classNames(
        styles.frame,
        showBackground && styles.tailwindFrame,
        !darkMode && styles.tailwindFrameLightMode,
        !showBackground && styles.noBackground,
        isSafari && styles.isSafari,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      {showBackground && <img src={beams.src} alt="beams" className={styles.tailwindBeams} />}
      <div className={styles.beams} />
      <div className={styles.tailwindWindow}>
        {showBackground && (
          <>
            <span className={styles.tailwindGridlinesHorizontal} data-grid></span>
            <span className={styles.tailwindGridlinesVertical} data-grid></span>
            <div className={styles.tailwindGradient}>
              <div>
                <div className={styles.tailwindGradient1}></div>
                <div className={styles.tailwindGradient2}></div>
              </div>
            </div>
          </>
        )}
        <div className={styles.tailwindHeader}>
          <div className={styles.controls}>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
          </div>
        </div>
        <Editor />
      </div>
    </div>
  );
};

const ClerkFrame = () => {
  const [darkMode] = useAtom(darkModeAtom);
  const [padding] = useAtom(paddingAtom);
  const [showBackground] = useAtom(showBackgroundAtom);

  return (
    <div
      className={classNames(
        styles.frame,
        showBackground && styles.clerkFrame,
        !darkMode && styles.clerkFrameLightMode,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      {showBackground && <img src={clerkPattern.src} alt="" className={styles.clerkPattern} />}
      <div className={styles.clerkWindow}>
        <div className={styles.clerkCode}>
          <Editor />
        </div>
      </div>
    </div>
  );
};

const MintlifyFrame = () => {
  const [darkMode] = useAtom(darkModeAtom);
  const [padding] = useAtom(paddingAtom);
  const [showBackground] = useAtom(showBackgroundAtom);
  const [fileName, setFileName] = useAtom(fileNameAtom);

  return (
    <div
      className={classNames(
        styles.frame,
        showBackground && styles.mintlifyFrame,
        !darkMode && styles.mintlifyFrameLightMode,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      {showBackground && (
        <span className={styles.mintlifyPatternWrapper}>
          <img
            src={darkMode ? mintlifyPatternDark.src : mintlifyPatternLight.src}
            alt=""
            className={styles.mintlifyPattern}
          />
        </span>
      )}
      <div className={styles.mintlifyWindow}>
        <div className={styles.mintlifyHeader}>
          <div className={classNames(styles.fileName, styles.mintlifyFileName)} data-value={fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              spellCheck={false}
              tabIndex={-1}
              size={1}
            />
            {fileName.length === 0 ? <span>Untitled-1</span> : null}
          </div>
        </div>
        <Editor />
      </div>
    </div>
  );
};

const PrismaFrame = () => {
  const [darkMode] = useAtom(darkModeAtom);
  const [padding] = useAtom(paddingAtom);
  const [showBackground] = useAtom(showBackgroundAtom);

  return (
    <div
      className={classNames(
        styles.frame,
        styles.prismaFrame,
        !darkMode && styles.prismaFrameLightMode,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      <div className={styles.prismaWindow}>
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        <Editor />
      </div>
    </div>
  );
};

const OpenAIFrame = () => {
  const [darkMode] = useAtom(darkModeAtom);
  const [padding] = useAtom(paddingAtom);
  const [showBackground] = useAtom(showBackgroundAtom);
  return (
    <div
      className={classNames(
        styles.openAIFrame,
        !darkMode && styles.openAIFrameLightMode,
        !showBackground && styles.noBackground,
      )}
      style={{ padding, "--padding": `${padding}px` } as React.CSSProperties}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      <div className={styles.openAIWindow}>
        <Editor />
      </div>
    </div>
  );
};

const DefaultFrame = () => {
  const [padding] = useAtom(paddingAtom);
  const isSafari = useIsSafari();
  const [showBackground] = useAtom(showBackgroundAtom);
  const [theme] = useAtom(themeAtom);
  const [themeBackground] = useAtom(themeBackgroundAtom);
  const [themeCSS] = useAtom(themeCSSAtom);
  const [fileName, setFileName] = useAtom(fileNameAtom);
  const darkMode = useAtomValue(darkModeAtom);
  const themeFont = useAtomValue(themeFontAtom);

  return (
    <div
      className={classNames(
        styles.frame,
        styles[theme.id],
        darkMode && styles.darkMode,
        showBackground && styles.withBackground,
      )}
      style={{ padding, backgroundImage: showBackground ? themeBackground : "" }}
    >
      {!showBackground && <div data-ignore-in-export className={styles.transparentPattern}></div>}
      <div
        className={classNames(styles.window, {
          [styles.withBorder]: !isSafari,
          [styles.withShadow]: !isSafari && showBackground,
        })}
        style={themeCSS}
      >
        <div className={styles.header}>
          <div className={styles.controls}>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
          </div>
          <div className={styles.fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              spellCheck={false}
              tabIndex={-1}
            />
            {fileName.length === 0 ? <span data-ignore-in-export>Untitled-1</span> : null}
          </div>
        </div>
        <Editor />
      </div>
    </div>
  );
};

function renderThemedFrame(selectedTheme: any) {
  switch (selectedTheme.id) {
    case THEMES.vercel.id:
    case THEMES.rabbit.id:
      return <VercelFrame />;
    case THEMES.supabase.id:
      return <SupabaseFrame />;
    case THEMES.tailwind.id:
      return <TailwindFrame />;
    case THEMES.clerk.id:
      return <ClerkFrame />;
    case THEMES.mintlify.id:
      return <MintlifyFrame />;
    case THEMES.openai.id:
      return <OpenAIFrame />;
    case THEMES.prisma.id:
      return <PrismaFrame />;
    default:
      return <DefaultFrame />;
  }
}

const Frame = ({
  resize = true,
  code,
  files,
  currentFile,
  handleChangeFile,
  selectedFiles,
  ephemeralDarkMode,
  ephemeralTheme,
  ephemeralBackground,
  ephemeralPadding,
  ephemeralLineNumbers,
  ephemeralLanguage,
  ephemeralFileName,
  ephemeralCode,
  ephemeralRef,
}: FrameProps) => {
  const frameContext = useContext(FrameContext);

  const setCode = useSetAtom(codeAtom);

  useEffect(() => {
    if (ephemeralCode != null) {
      setCode(ephemeralCode);
    } else if (code) {
      setCode(code);
    }
  }, [code, ephemeralCode, setCode]);

  const isMultiSelect = selectedFiles.length > 1;

  const theme = useAtomValue(themeAtom);
  const darkMode = useAtomValue(darkModeAtom);

  const effectiveTheme = ephemeralTheme ?? theme;
  const effectiveDarkMode = ephemeralDarkMode ?? darkMode;

  return (
    <div className={styles.frameContainer} data-theme={effectiveDarkMode ? "dark" : "light"}>
      <ResizableFrame files={files} onChangeFile={handleChangeFile}>
        <FlashMessage />
        <div ref={ephemeralRef ?? frameContext} className={styles.outerFrame} id="frame">
          {isMultiSelect ? <BulkEditPlaceholder selectedFiles={selectedFiles} /> : renderThemedFrame(effectiveTheme)}
        </div>
      </ResizableFrame>
    </div>
  );
};

export default Frame;
