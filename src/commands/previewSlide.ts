import arg from "arg";
import { writeFile } from "node:fs/promises";
import process from "node:process";
import { checkSlideFrontmatterType } from "../lib/check-slide-frontmatter-type";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import { validateSlide } from "../lib/validators/slide-validator";
import type { SlidePreview } from "../qiita-api";

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (char) => htmlEscapes[char]);

const renderHtml = (title: string, { pages, css }: SlidePreview) => {
  const renderedPages = pages
    .map(
      ({ html }) => `<div class="page">
<template shadowrootmode="open">
<style>${css}</style>
<div class="marp-slide-container">${html}</div>
</template>
</div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
body { display: flex; flex-direction: column; gap: 24px; margin: 24px; }
.page { aspect-ratio: 16 / 9; border: 1px solid #ccc; overflow: hidden; width: 100%; }
</style>
</head>
<body>
${renderedPages}
</body>
</html>
`;
};

export const previewSlide = async (argv: string[]) => {
  const args = arg({ "--output": String, "-o": "--output" }, { argv });
  const basename = args._[0];
  const outputPath = args["--output"];

  if (!basename || !outputPath) {
    console.error("Usage: qiita preview-slide <basename> --output <file>");
    process.exit(1);
    return;
  }

  const slideFileSystemRepo = await getSlideFileSystemRepo();
  const slide = await slideFileSystemRepo.loadSlideByBasename(basename);
  if (!slide) {
    console.error(`Error: slide '${basename}' is not found`);
    process.exit(1);
    return;
  }

  const frontmatterErrors = checkSlideFrontmatterType(slide);
  if (frontmatterErrors.length > 0) {
    frontmatterErrors.forEach((message) => console.error(`Error: ${message}`));
    process.exit(1);
    return;
  }

  validateSlide(slide).forEach((message) =>
    console.error(`Warning: ${message}`),
  );

  const qiitaApi = await getQiitaApiInstance();
  const preview = await qiitaApi.previewSlide(slide.toMarkdown());

  await writeFile(outputPath, renderHtml(slide.title, preview));
  console.log(outputPath);
};
