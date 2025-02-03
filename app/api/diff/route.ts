import { UserFile } from "@/app/(navigation)/(code)/hooks/useFiles";
import gitDiffParser from "gitdiff-parser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function reconstructFileContent(file: UserFile): string {
  if (file.type === "delete") {
    return "/* This file was deleted by the patch */";
  }

  const lines: string[] = [];

  if (file.hunks) {
    for (const hunk of file.hunks) {
      let newLineIndex = hunk.newStart;

      for (const change of hunk.changes) {
        if (change.type === "normal" || change.type === "insert") {
          let text = change.content;
          if (text.startsWith(" ") || text.startsWith("+")) {
            text = text.substring(1);
          }
          lines.push(text);
          newLineIndex++;
        }
      }
    }

    if (lines.length === 0) {
      return "/* No new content for this file or patch was empty. */";
    }
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const patchFile = formData.get("patchFile");

    if (!patchFile || !(patchFile instanceof Blob)) {
      return NextResponse.json({ error: "Missing or invalid patchFile in form data" }, { status: 400 });
    }

    const diffText = await patchFile.text();
    const parsed = gitDiffParser.parse(diffText);

    const results = parsed.map((diffFile) => {
      const cleanedNew = diffFile.newPath.replace(/^b\//, "") || "unknown.patch";

      return {
        ...diffFile,
        name: cleanedNew,
        content: reconstructFileContent(diffFile as UserFile),
      };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Error processing patch:", err);
    return NextResponse.json({ error: "Failed to process patch file." }, { status: 500 });
  }
}
