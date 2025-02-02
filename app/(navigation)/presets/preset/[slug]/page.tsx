import { getAvailableAiModels } from "@/api/ai";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PresetDetail } from "../../components/PresetDetail";
import { allPresets } from "../../presets";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const preset = allPresets.find((preset) => preset.id === params.slug);
  if (!preset) {
    notFound();
  }
  const pageTitle = `${preset.name} - Raycast AI Preset`;
  const ogImage = `/presets/og?title=${encodeURIComponent(preset.name)}&description=${encodeURIComponent(
    preset.description || "",
  )}&icon=${preset.icon}`;

  return {
    title: pageTitle,
    description: preset.description,
    openGraph: {
      type: "website",
      url: `/presets/preset/${params.slug}`,
      title: pageTitle,
      description: preset.description,
      siteName: "Ray.so",
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@raycastapp",
      title: pageTitle,
      description: preset.description,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    other: {
      "twitter:label1": "Model",
      "twitter:data": preset.model,
      "twitter:label2": "Creativity",
      "twitter:data2": preset.creativity,
    },
  };
}

export default async function Page(props: Props) {
  const params = await props.params;
  if (!params.slug) {
    notFound();
  }

  const preset = allPresets.find((preset) => preset.id === params.slug);

  if (!preset) {
    notFound();
  }

  const relatedPresets = allPresets
    .filter((p) => p.id !== preset.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  const models = await getAvailableAiModels();

  return <PresetDetail preset={preset} relatedPresets={relatedPresets} models={models} />;
}

export async function generateStaticParams() {
  return allPresets.map((preset) => ({
    slug: preset.id,
  }));
}
