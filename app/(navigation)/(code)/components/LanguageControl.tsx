import { Select, SelectContent, SelectItem, SelectItemText, SelectTrigger, SelectValue } from "@/components/select";
import { cn } from "@/utils/cn";
import { ChevronUpIcon } from "@raycast/icons";
import { useAtom } from "jotai";
import React, { useState } from "react";
import useHotkeys from "../../../../utils/useHotkeys";
import { loadingLanguageAtom } from "../store";
import { autoDetectLanguageAtom, selectedLanguageAtom } from "../store/code";
import { Language, LANGUAGES } from "../util/languages";
import ControlContainer from "./ControlContainer";
import styles from "./LanguageControl.module.css";

const LanguageControl: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [autoDetectLanguage] = useAtom(autoDetectLanguageAtom);
  const [isLoadingLanguage] = useAtom(loadingLanguageAtom);

  useHotkeys("l", (event) => {
    event.preventDefault();
    if (!isOpen) {
      setOpen(true);
    }
  });

  return (
    <ControlContainer title="Language">
      <Select
        open={isOpen}
        onOpenChange={(open) => setOpen(open)}
        value={selectedLanguage?.name || "auto-detect"}
        onValueChange={(value) => {
          if (value === "auto-detect") {
            setSelectedLanguage(null);
          } else {
            setSelectedLanguage(Object.values(LANGUAGES).find((l) => l.name === value) as Language);
          }
        }}
      >
        <SelectTrigger
          size="small"
          className={cn("w-[146px]", isLoadingLanguage && styles.loadingShimmer)}
          icon={ChevronUpIcon}
        >
          <SelectValue />
          {autoDetectLanguage ? "(auto)" : ""}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto-detect">
            <SelectItemText>Auto-Detect</SelectItemText>
          </SelectItem>
          {Object.values(LANGUAGES).map((language, index) => (
            <SelectItem key={index} value={language.name}>
              <SelectItemText>{language.name}</SelectItemText>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ControlContainer>
  );
};

export default LanguageControl;
