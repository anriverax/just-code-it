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

import { Transition } from "./picture-grid.type";

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

export const DATASET_KEY = "elegantPictureBoxId";

export const toArray = <T extends Element>(arrLike: ArrayLike<T> | HTMLCollectionOf<T>): T[] => {
  if (!arrLike) return [];
  return Array.from(arrLike);
};
