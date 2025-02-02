import { BASE_URL } from "@/utils/common";
import { readFile } from "fs";
import { glob } from "glob";
import { basename, join } from "path";
import { promisify } from "util";

type ThemeColors = {
  background: string;
  backgroundSecondary: string;
  text: string;
  selection: string;
  loader: string;
  red: string;
  orange: string;
  yellow: string;
  green: string;
  blue: string;
  purple: string;
  magenta: string;
};

export type Theme = {
  author: string;
  authorUsername: string;
  version: string;
  name: string;
  slug?: string;
  appearance: "light" | "dark";
  colors: ThemeColors;
};

const themesDir = join(process.cwd(), "app", "(navigation)", "themes", "themes");

const readFileAsync = promisify(readFile);

export async function getAllThemes(): Promise<Theme[]> {
  const allThemePaths = await glob(`${themesDir}/**/*.json`);
  const sortedThemePaths = allThemePaths.sort((a, b) => {
    const aFileName = basename(a);
    const bFileName = basename(b);
    return aFileName.localeCompare(bFileName);
  });

  const themes = await Promise.all(
    sortedThemePaths.map(async (filePath) => {
      const fileName = basename(filePath);
      const data = await readFileAsync(filePath);
      const themeData = JSON.parse(data.toString());

      const parentDirName = basename(filePath.replace(fileName, ""));
      const slug = `${parentDirName}/${fileName.replace(".json", "")}`.toLowerCase();

      return { ...themeData, slug, og_image: `${BASE_URL}/themes-og/${slug.replace("/", "_")}.png` };
    }),
  );

  return themes;
}

// This function checks whether the query params generated from Raycast's Theme Studio
// can be converted into a Theme object that is used in this App

function canConvertParamsToTheme(params: Theme): boolean {
  const { appearance, name, version, colors } = params;
  return Boolean(appearance && name && version && colors);
}

function convertLegacyColorIfNeeded(color: string) {
  const [, value] = color.split("#");
  if (value.length === 8) {
    return `#${value.slice(0, -2)}`;
  }
  return color;
}

// This function converts the query params generated from Raycast's Theme Studio
// into a Theme object that is used in this App
export function makeThemeObjectFromParams(params: Theme & { colors: string | ThemeColors }): Theme | undefined {
  if (canConvertParamsToTheme(params)) {
    const { appearance, name, author, authorUsername, version, colors: colorString } = params;

    if (typeof colorString !== "string") {
      return undefined;
    }
    const colorArray = colorString.split(",");

    const colorObject = {
      background: convertLegacyColorIfNeeded(colorArray[0]),
      backgroundSecondary: convertLegacyColorIfNeeded(colorArray[1]),
      text: convertLegacyColorIfNeeded(colorArray[2]),
      selection: convertLegacyColorIfNeeded(colorArray[3]),
      loader: convertLegacyColorIfNeeded(colorArray[4]),
      red: convertLegacyColorIfNeeded(colorArray[5]),
      orange: convertLegacyColorIfNeeded(colorArray[6]),
      yellow: convertLegacyColorIfNeeded(colorArray[7]),
      green: convertLegacyColorIfNeeded(colorArray[8]),
      blue: convertLegacyColorIfNeeded(colorArray[9]),
      purple: convertLegacyColorIfNeeded(colorArray[10]),
      magenta: convertLegacyColorIfNeeded(colorArray[11]),
    };

    return {
      appearance,
      name,
      version,
      author,
      authorUsername,
      colors: colorObject,
    };
  } else {
    return undefined;
  }
}
