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
      // Remove any leading "b/" from the newPath
      const cleaned = file.newPath.replace(/^b\//, "");

      let newContent = "";

      // Iterate over the hunks, then over each change
      for (const hunk of file.hunks) {
        for (const change of hunk.changes) {
          // Only collect inserted lines (type === "insert")
          if (change.type === "insert") {
            // Optionally remove the leading "+"
            newContent += change.content.replace(/^\+/, "") + "\n";
          }
        }
      }

      // If no inserted lines, optionally store some placeholder
      if (!newContent.trim()) {
        newContent = `/* No new lines for ${cleaned} */`;
      }

      return {
        fileName: cleaned || "unknown.patch",
        content: newContent,
      };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Error processing patch:", err);
    return NextResponse.json({ error: "Failed to process patch file." }, { status: 500 });
  }
}
