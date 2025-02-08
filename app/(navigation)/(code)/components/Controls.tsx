import React from "react";
import { UserFile } from "../hooks/useFiles";
import BackgroundControl from "./BackgroundControl";
import styles from "./Controls.module.css";
import DarkModeControl from "./DarkModeControl";
import HiddenCharsControl from "./HiddenCharsControl";
import LanguageControl from "./LanguageControl";
import LineHeightControl from "./LineHeightControl";
import PaddingControl from "./PaddingControl";
import ThemeControl from "./ThemeControl";

interface ControlsProps {
  files: UserFile[];
  selectedFiles: UserFile[];
}

const Controls: React.FC<ControlsProps> = ({ files, selectedFiles }) => {
  return (
    <div className={styles.controls}>
      <ThemeControl />
      <BackgroundControl />
      <DarkModeControl />
      <HiddenCharsControl />
      <PaddingControl />
      <LineHeightControl />
      {files.length > 0 && !(selectedFiles.length > 1) && <LanguageControl />}
    </div>
  );
};

export default Controls;
