import { Switch } from "@/components/switch";
import { useAtom } from "jotai";
import React from "react";
import useHotkeys from "../../../../utils/useHotkeys";
import { showBackgroundAtom } from "../store";
import ControlContainer from "./ControlContainer";

const BackgroundControl: React.FC = () => {
  const [showBackground, setShowBackground] = useAtom(showBackgroundAtom);

  useHotkeys("b", () => {
    setShowBackground((old) => !old);
  });

  return (
    <ControlContainer title="Background">
      <Switch checked={showBackground} onCheckedChange={setShowBackground} />
    </ControlContainer>
  );
};

export default BackgroundControl;
