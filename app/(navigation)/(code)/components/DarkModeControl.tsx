import { Switch } from "@/components/switch";
import { useAtom } from "jotai";
import React, { useCallback } from "react";
import useHotkeys from "../../../../utils/useHotkeys";
import { darkModeAtom } from "../store/themes";
import ControlContainer from "./ControlContainer";

const BackgroundControl: React.FC = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  const toggleDarkMode = useCallback(() => setDarkMode((old) => !old), [setDarkMode]);

  useHotkeys("d", toggleDarkMode);

  return (
    <ControlContainer title="Dark mode">
      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
    </ControlContainer>
  );
};

export default BackgroundControl;
