import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist", "highlight.js"],
  experimental: {
    optimizePackageImports: ["shiki"],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: { test?: RegExp }) => rule.test?.test?.(".svg"));

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "removeViewBox",
                    active: false,
                  },
                ],
              },
            },
          },
        ],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    // find the built-in loader
    const imageLoaderRule = config.module.rules.find(
      (rule: { loader?: string }) => rule.loader === "next-image-loader",
    );
    // make the loader ignore *.inline files
    imageLoaderRule.exclude = /\.inline\.(png|jpg|svg)$/i;

    // add a new URL loader for *.inline files
    config.module.rules.push({
      test: /\.inline\.(png|jpg|gif)$/i,
      use: [
        {
          loader: "url-loader",
        },
      ],
    });

    return config;
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/:path*",
          destination: "https://go.ray.so/:path*",
        },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "icon.ray.so",
          },
        ],
        destination: "https://ray.so/icon/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "icons.ray.so",
          },
        ],
        destination: "https://ray.so/icon/:path*",
        permanent: true,
      },
      {
        source: "/((?!_next|api)):path(.*)",
        has: [
          {
            type: "host",
            value: "prompts.ray.so",
          },
        ],
        destination: "https://ray.so/prompts/:path*",
        permanent: true,
      },
      {
        source: "/((?!_next|api)):path(.*)",
        has: [
          {
            type: "host",
            value: "presets.ray.so",
          },
        ],
        destination: "https://ray.so/presets/:path*",
        permanent: true,
      },
      {
        source: "/((?!_next|api)):path(.*)",
        has: [
          {
            type: "host",
            value: "snippets.ray.so",
          },
        ],
        destination: "https://ray.so/snippets/:path*",
        permanent: true,
      },
      {
        source: "/((?!_next|api)):path(.*)",
        has: [
          {
            type: "host",
            value: "themes.ray.so",
          },
        ],
        destination: "https://ray.so/themes/:path*",
        permanent: true,
      },
      {
        source: "/api/:path*",
        has: [
          {
            type: "host",
            value: "prompts.ray.so",
          },
        ],
        destination: "https://ray.so/api/:path*",
        permanent: true,
      },
      {
        source: "/api/:path*",
        has: [
          {
            type: "host",
            value: "presets.ray.so",
          },
        ],
        destination: "https://ray.so/api/:path*",
        permanent: true,
      },
      {
        source: "/api/:path*",
        has: [
          {
            type: "host",
            value: "snippets.ray.so",
          },
        ],
        destination: "https://ray.so/api/:path*",
        permanent: true,
      },
      {
        source: "/api/:path*",
        has: [
          {
            type: "host",
            value: "themes.ray.so",
          },
        ],
        destination: "https://ray.so/api/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/shorten-url",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
