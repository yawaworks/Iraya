// Canonical list of aesthetic tags — keep this in sync with whatever
// tags you use when seeding/tagging products, or matching breaks silently.
export const AESTHETIC_TAGS = [
  { id: "alt", label: "Alt" },
  { id: "clean girl", label: "Clean Girl" },
  { id: "old money", label: "Old Money" },
  { id: "coquette", label: "Coquette" },
  { id: "streetwear", label: "Streetwear" },
  { id: "y2k", label: "Y2K" },
] as const

export type AestheticTagId = (typeof AESTHETIC_TAGS)[number]["id"]