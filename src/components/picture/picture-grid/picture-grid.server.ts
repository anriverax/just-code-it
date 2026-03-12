import { readdir } from "node:fs/promises";
import path from "node:path";

import { PortfolioImage } from "./picture-grid.type";

const PICTURE_SUBDIR = "picture";
const PICTURE_DIR = path.join(process.cwd(), "public", PICTURE_SUBDIR);
const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

const SHIMMER_SVG = `
<svg width="700" height="475" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="700" height="475" fill="#333" />
  <rect id="r" width="700" height="475" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-700" to="700" dur="1s" repeatCount="indefinite" />
</svg>`;

const BLUR_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(SHIMMER_SVG).toString("base64")}`;

export const getPortfolioImages = async (): Promise<PortfolioImage[]> => {
  const files = await readdir(PICTURE_DIR, { withFileTypes: true });

  return files
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .filter((fileName) => VALID_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((fileName) => ({
      img: `/${PICTURE_SUBDIR}/${fileName}`,
      name: path.parse(fileName).name,
      blurDataURL: BLUR_DATA_URL
    }));
};
