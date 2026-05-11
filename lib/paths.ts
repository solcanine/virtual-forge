import path from "path";

export function dataDir() {
  return path.join(process.cwd(), "data");
}
