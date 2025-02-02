import gitDiffParser from "gitdiff-parser";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const patchFile = formData.get("patchFile") as File | null;

    if (!patchFile) {
      return NextResponse.json({ error: "Missing patchFile in form data" }, { status: 400 });
    }

    const diffText = await patchFile.text();
    const parsed = gitDiffParser.parse(diffText);

    const results = parsed.map((file) => {
      const { oldPath, newPath } = file;

      const cleanedNewPath = newPath.replace(/^b\//, "");
      const cleanedOldPath = oldPath.replace(/^a\//, "");

      const pathParts = cleanedNewPath.split("/");
      const fileName = pathParts.pop() || "unknown";
      const directory = pathParts.join("/");

      return {
        oldPath: cleanedOldPath,
        newPath: cleanedNewPath,
        directory,
        fileName,
        ...parsed,
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Error processing patch:", err as Error);
    return NextResponse.json({ error: "Failed to process patch file." }, { status: 500 });
  }
}
