import { transliterate } from "transliteration";

const slugify = (str) =>
  transliterate(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default slugify;
