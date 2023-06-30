import fs from "node:fs/promises";
import path from "node:path";

const packageJsonFilePath = path.join(__dirname, "../../package.json");

export const version = async () => {
  const data = await fs.readFile(packageJsonFilePath, { encoding: "utf8" });
  const { version } = JSON.parse(data);

  if (!version) {
    throw new Error("Error: version is not found");
  }

  console.log(version);
};
