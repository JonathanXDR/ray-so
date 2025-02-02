"use client";

import { Button } from "@/components/button";
import { toast } from "@/components/toast";
import { cn } from "@/utils/cn";
import useHotkeys from "@/utils/useHotkeys";
import { WandIcon } from "@raycast/icons";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { codeAtom, selectedLanguageAtom } from "../store/code";
import formatCode, { formatterSupportedLanguages } from "../util/formatCode";

const FormatButton: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [code, setCode] = useAtom(codeAtom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFormatCode = () => {
    const isSupportedLanguage = formatterSupportedLanguages.includes(selectedLanguage?.name || "");
    if (!isSupportedLanguage) {
      return toast.error("Formatting is not supported for this language");
    }
    if (!code || !selectedLanguage) {
      return;
    }
    const language = selectedLanguage;
    toast.promise(
      formatCode(code, language).then((formatted) => {
        setCode(formatted);
        // Sometimes hljs thinks the formatted code is a different language
        // than the original, so we enforce the original language here
        setSelectedLanguage(language);
      }),
      {
        loading: "Formatting code...",
        success: "Formatted code!",
        error: (data) => {
          return (
            <div className="space-y-2 overflow-hidden">
              <p className="font-medium">Code formatting failed</p>
              <pre className="w-full overflow-auto text-xs scrollbar-hide bg-gray-a3 p-2.5 rounded-sm">
                <code className="w-full">{data.message}</code>
              </pre>
            </div>
          );
        },
      },
    );
  };

  useHotkeys("shift+option+f", (event) => {
    event.preventDefault();
    handleFormatCode();
  });

  if (!isClient) {
    return null;
  }

  return (
    <Button
      onClick={handleFormatCode}
      variant="transparent"
      className={cn(
        "hidden",
        selectedLanguage && formatterSupportedLanguages.includes(selectedLanguage.name) && "md:inline-flex",
      )}
    >
      <WandIcon width={16} height={16} />
      Format Code
    </Button>
  );
};

export default FormatButton;
