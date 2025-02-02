import React from "react";
import BackgroundControl from "./BackgroundControl";
import styles from "./Controls.module.css";
import DarkModeControl from "./DarkModeControl";
import LanguageControl from "./LanguageControl";
import PaddingControl from "./PaddingControl";
import ThemeControl from "./ThemeControl";

const Controls: React.FC = () => {
  return (
    <div className={styles.controls}>
      <ThemeControl />
      <BackgroundControl />
      <DarkModeControl />
      <PaddingControl />
      <LanguageControl />
    </div>
  );
};

export default Controls;
