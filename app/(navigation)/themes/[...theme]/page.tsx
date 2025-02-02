import { BASE_URL } from "@/utils/common";
import { Desktop } from "@themes/components/desktop";
import { PageWithThemeMode } from "@themes/components/page-with-theme-mode";
import { Raycast } from "@themes/components/raycast";
import { getAllThemes } from "@themes/lib/theme";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ theme: [author: string, theme: string] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const [author, themeName] = params.theme;

  const slug = `${author}/${themeName}`;
  const themes = await getAllThemes();
  const theme = themes.find((theme) => theme.slug === slug);

  if (!theme) {
    return {};
  }

  const { colors, ...restTheme } = theme;

  const queryParams = new URLSearchParams();
  Object.entries(restTheme).forEach(([key, value]) => queryParams.set(key, value));
  Object.entries(colors).forEach(([key, value]) => queryParams.set(key, value));

  const title = `${restTheme.name} by ${restTheme.author}`;
  const image = `${BASE_URL}/themes/og?${queryParams}`;

  return {
    title,
    openGraph: {
      title,
      url: `/themes/${author}/${themeName}`,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      title,
      images: [
        {
          url: image,
        },
      ],
    },
  };
}

export default async function ThemePage(props: { params: Promise<{ theme: [author: string, theme: string] }> }) {
  const params = await props.params;
  const [author, themeName] = params.theme;
  const slug = `${author}/${themeName}`;
  const themes = await getAllThemes();
  const theme = themes.find((theme) => theme.slug === slug);

  if (!theme) {
    redirect("/");
  }

  return (
    <PageWithThemeMode theme={theme}>
      <Desktop>
        <Raycast />
      </Desktop>
    </PageWithThemeMode>
  );
}
