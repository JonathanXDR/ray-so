import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useAtom } from "jotai";
import React from "react";
import useHotkeys from "../../../../utils/useHotkeys";
import { isLineHeight, LINE_HEIGHT_OPTIONS, lineHeightAtom } from "../store/lineHeight";
import ControlContainer from "./ControlContainer";
import styles from "./LineHeightControl.module.css";

const LineHeightControl: React.FC = () => {
  const [lineHeight, setLineHeight] = useAtom(lineHeightAtom);

  useHotkeys("h", (e) => {
    console.info(e.target);
    const currentIndex = LINE_HEIGHT_OPTIONS.indexOf(lineHeight);
    if (LINE_HEIGHT_OPTIONS[currentIndex + 1]) {
      setLineHeight(LINE_HEIGHT_OPTIONS[currentIndex + 1]);
    } else {
      setLineHeight(LINE_HEIGHT_OPTIONS[0]);
    }
  });

  return (
    <ControlContainer title="Line Height">
      <ToggleGroup.Root
        className={styles.toggleGroup}
        type="single"
        value={`${lineHeight}`}
        aria-label="Frame Line Height"
        onValueChange={(value) => {
          const intValue = parseInt(value, 10);
          if (isLineHeight(intValue)) {
            setLineHeight(intValue);
          }
        }}
      >
        {LINE_HEIGHT_OPTIONS.map((lineHeightOption) => (
          <ToggleGroup.Item
            key={lineHeightOption}
            className={styles.toggleGroupItem}
            value={`${lineHeightOption}`}
            aria-label={`${lineHeightOption}`}
          >
            {lineHeightOption}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </ControlContainer>
  );
};

export default LineHeightControl;
