import { NavigationActions } from "@/components/navigation";
import { Providers } from "@themes/components/providers";
import { ThemeControls } from "@themes/components/theme-controls";
import { ThemeSwitcher } from "@themes/components/theme-switcher";
import { getAllThemes } from "@themes/lib/theme";
import { InfoDialog } from "./components/info-dialog";

export const metadata = {
  title: "Theme Explorer by Raycast",
  description: "A tool to easily share, browse and import Raycast Themes.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const themes = await getAllThemes();

  return (
    <Providers themes={themes}>
      <div className="flex flex-col h-[calc(100dvh-50px)] items-center 2xl:pt-3 themes-body">
        <div className="flex flex-col flex-1 overflow-hidden shadow-[0px_0px_29px_10px_rgba(0,0,0,0.06)] dark:shadow-[0px_0px_29px_10px_rgba(255,255,255,.06)] max-w-(--breakpoint-2xl) w-full 2xl:rounded-xl">
          {children}
        </div>
        <ThemeControls themes={themes} />
        <ThemeSwitcher themes={themes} />
        <NavigationActions className="hidden sm:flex">
          <InfoDialog />
        </NavigationActions>
      </div>
    </Providers>
  );
}
