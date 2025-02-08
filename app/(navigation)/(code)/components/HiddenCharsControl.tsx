import { Switch } from "@/components/switch";
import { useAtom } from "jotai";
import React from "react";
import useHotkeys from "../../../../utils/useHotkeys";
import { showHiddenCharsAtom } from "../store";
import ControlContainer from "./ControlContainer";

const HiddenCharsControl: React.FC = () => {
  const [showHiddenChars, setShowHiddenChars] = useAtom(showHiddenCharsAtom);

  useHotkeys("c", () => {
    setShowHiddenChars((old) => !old);
  });

  return (
    <ControlContainer title="Hidden Chars">
      <Switch checked={showHiddenChars} onCheckedChange={setShowHiddenChars} />
    </ControlContainer>
  );
};

export default HiddenCharsControl;
