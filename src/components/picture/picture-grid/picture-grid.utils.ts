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

export const popmotionEasing = {
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

export type TransitionKey = keyof typeof popmotionEasing;

export const GRID_ITEM_KEY = "pictureGridItemId";

export const toArray = <T extends Element>(
  arrLike: ArrayLike<T> | HTMLCollectionOf<T> | null | undefined
): T[] => {
  if (!arrLike) return [];
  return Array.from(arrLike);
};
