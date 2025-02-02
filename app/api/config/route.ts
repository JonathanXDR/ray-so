import { PADDING_OPTIONS } from "@code/store/padding";
import { THEMES } from "@code/store/themes";
import { LANGUAGES } from "@code/util/languages";
import { NextResponse } from "next/server";

export async function GET() {
  const languages = Object.entries(LANGUAGES).map(([key, { ...rest }]) => ({ id: key, ...rest }));
  const themes = Object.entries(THEMES).map(([, { ...rest }]) => ({ ...rest }));
  const padding = PADDING_OPTIONS;
  return NextResponse.json({ languages, themes, padding });
}
