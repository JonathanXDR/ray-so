import classnames from "classnames";
import { useAtom } from "jotai";
import React, { MouseEventHandler, PropsWithChildren, useCallback, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import XMarkIcon from "../assets/icons/x-mark-circle-filled-16.svg";
import { UserFile } from "../hooks/useFiles";
import { windowWidthAtom } from "../store";
import { FileCarousel } from "./FileCarousel";
import styles from "./ResizableFrame.module.css";

type Handle = "right" | "left";

interface ResizableFrameProps extends PropsWithChildren {
  files: UserFile[];
  onChangeFile: (file: UserFile, index: number) => void;
}

let maxWidth = 920;
let minWidth = 520;

const ResizableFrame: React.FC<ResizableFrameProps> = ({ children, files, onChangeFile }) => {
  const currentHandleRef = useRef<Handle>();
  const windowRef = useRef<HTMLDivElement>(null);
  const startWidthRef = useRef<number>();
  const startXRef = useRef<number>();
  const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
  const [isResizing, setResizing] = useState(false);
  const resetWindowWidthRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  const mouseMoveHandler = useCallback(
    (event: MouseEvent) => {
      let newWidth;

      if (currentHandleRef.current === "left") {
        newWidth = startWidthRef.current! - (event.clientX - startXRef.current!) * 2;
      } else {
        newWidth = startWidthRef.current! + (event.clientX - startXRef.current!) * 2;
      }

      if (newWidth > maxWidth) {
        newWidth = maxWidth;
      } else if (newWidth < minWidth) {
        newWidth = minWidth;
      }

      setWindowWidth(newWidth);
    },
    [setWindowWidth],
  );

  const clearSelection = useCallback(() => {
    var sel = document.getSelection();
    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
  }, []);

  const mouseUpHandler = useCallback(() => {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
    setResizing(false);
    clearSelection();
  }, [mouseMoveHandler, clearSelection]);

  const handleResizeFrameX = useCallback(
    (handle: Handle): MouseEventHandler<HTMLDivElement> =>
      (event) => {
        currentHandleRef.current = handle;
        startWidthRef.current = windowRef.current!.offsetWidth;
        startXRef.current = event.clientX;
        setResizing(true);

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      },
    [mouseMoveHandler, mouseUpHandler],
  );

  return (
    <div className={classnames(styles.resizableFrame, isResizing && styles.isResizing)}>
      <div
        className={classnames(styles.windowSizeDragPoint, styles.left)}
        onMouseDown={handleResizeFrameX("left")}
      ></div>
      <div
        className={classnames(styles.windowSizeDragPoint, styles.right)}
        onMouseDown={handleResizeFrameX("right")}
      ></div>
      <div ref={windowRef} style={{ width: windowWidth || "auto" }}>
        {children}
      </div>

      {(!!(windowWidth && !isResizing) || isResizing || (files && files.length !== 0)) && (
        <FileCarousel
          className="flex w-full mt-[1em]"
          files={files}
          onChangeFile={onChangeFile}
          showButtons={files && files.length !== 0 && !isResizing}
        >
          <CSSTransition
            nodeRef={resetWindowWidthRef}
            in={!!(windowWidth && !isResizing)}
            unmountOnExit
            timeout={200}
            classNames={{
              enter: styles.fadeEnter,
              enterActive: styles.fadeEnterActive,
              exit: styles.fadeExit,
              exitActive: styles.fadeExitActive,
            }}
          >
            <div className={styles.resetWidthContainer} ref={resetWindowWidthRef}>
              <a
                className={styles.resetWidth}
                onClick={(event) => {
                  event.preventDefault();
                  setWindowWidth(null);
                }}
              >
                <XMarkIcon />
                Set to auto width
              </a>
            </div>
          </CSSTransition>

          <CSSTransition
            nodeRef={rulerRef}
            in={isResizing}
            unmountOnExit
            timeout={200}
            classNames={{
              enter: styles.fadeEnter,
              enterActive: styles.fadeEnterActive,
              exit: styles.fadeExit,
              exitActive: styles.fadeExitActive,
            }}
          >
            <div ref={rulerRef} className={styles.ruler}>
              <span>{windowWidth} px</span>
            </div>
          </CSSTransition>
        </FileCarousel>
      )}
    </div>
  );
};

export default ResizableFrame;
