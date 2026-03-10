import { readdir } from "node:fs/promises";
import path from "node:path";

import {
  anticipate,
  backIn,
  backInOut,
  backOut,
  circIn,
  circInOut,
  circOut,
  easeIn,
  easeInOut,
  easeOut,
  linear
} from "popmotion";

import { Transition, Image } from "./picture-grid.type";

export const popmotionEasing: Transition = {
  anticipate,
  backIn,
  backInOut,
  backOut,
  circIn,
  circInOut,
  circOut,
  easeIn,
  easeInOut,
  easeOut,
  linear
};

const PICTURE_DIR = path.join(process.cwd(), "public", "picture");
const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);


export const DATASET_KEY = "elegantPictureBoxId";

export const toArray = <T extends Element>(arrLike: ArrayLike<T> | HTMLCollectionOf<T>): T[] => {
  if (!arrLike) return [];
  return Array.prototype.slice.call(arrLike);
};

export const getPortfolioImages = async (): Promise<Image[]> => {
  const files = await readdir(PICTURE_DIR, { withFileTypes: true });

  return files
    .filter((file) => file.isFile())
    .map((file) => file.name)
    .filter((fileName) => VALID_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((fileName) => ({
      img: `/picture/${fileName}`,
      name: path.parse(fileName).name
    }));
}
