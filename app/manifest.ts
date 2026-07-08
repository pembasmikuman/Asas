import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Asas",
    short_name: "Asas",
    display: "standalone",
    start_url: "/",
    background_color: "#12280F",
    theme_color: "#12280F",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
