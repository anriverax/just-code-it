export const VIEW_KEYS = {
  GALLERY: "gallery"
} as const;

export type ViewKey = (typeof VIEW_KEYS)[keyof typeof VIEW_KEYS];
