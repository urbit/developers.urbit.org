import fs from "fs";
import path from "path";

export const CONTENT_PATH = path.join(process.cwd(), "content");

export const contentFilePaths = fs
  .readdirSync(CONTENT_PATH)
  // Only include md files...
  .filter((path) => /\.md$/.test(path))
  // ...without the .page.md suffix
  .filter((path) => /^((?!.*page.md*).)*$/.test(path));
