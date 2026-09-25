import arg from "arg";
import process from "node:process";
import { QiitaItem } from "../lib/entities/qiita-item";
import { QiitaSlide } from "../lib/entities/qiita-slide";
import type { FileSystemRepo } from "../lib/file-system-repo";
import type { SlideFileSystemRepo } from "../lib/slide-file-system-repo";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { syncSlidesFromQiita } from "../lib/sync-slides-from-qiita";
import { validatePublishItem } from "../lib/validators/item-validator";
import { validatePublishSlide } from "../lib/validators/slide-validator";
import {
  QiitaForbiddenError,
  QiitaForbiddenOrBadRequestError,
} from "../qiita-api";

interface PublishRepos {
  fileSystemRepo: FileSystemRepo;
  slideFileSystemRepo: SlideFileSystemRepo;
}

interface PublishTargets {
  items: QiitaItem[];
  slides: QiitaSlide[];
}

const loadAllPublishTargets = async ({
  fileSystemRepo,
  slideFileSystemRepo,
}: PublishRepos): Promise<PublishTargets> => ({
  items: await fileSystemRepo.loadPublishTargets(),
  slides: await slideFileSystemRepo.loadPublishTargets(),
});

// Articles and slides share one basename namespace on the command line, so
// resolving a basename is the only step that has to know about both stores.
const resolveTargetsByBasenames = async (
  basenames: string[],
  { fileSystemRepo, slideFileSystemRepo }: PublishRepos,
): Promise<PublishTargets> => {
  const items: QiitaItem[] = [];
  const slides: QiitaSlide[] = [];

  for (const basename of basenames) {
    const item = await fileSystemRepo.loadItemByBasename(basename);
    const slide = await slideFileSystemRepo.loadSlideByBasename(basename);

    if (item !== null && slide !== null) {
      console.error(
        `Error: '${basename}' exists both in the articles and the slides. Please rename one of them.`,
      );
      process.exit(1);
    } else if (item !== null) {
      items.push(item);
    } else if (slide !== null) {
      slides.push(slide);
    } else {
      console.error(`Error: '${basename}' is not found`);
      process.exit(1);
    }
  }

  return { items, slides };
};

const printValidationErrors = async (
  invalidMessages: { name: string; errors: string[] }[],
) => {
  const chalk = (await import("chalk")).default;
  invalidMessages.forEach((msg) => {
    msg.errors.forEach((err) => {
      const errorName = chalk.red.bold(msg.name + ":");
      const errorDescription = chalk.red(err);
      console.error(`${errorName} ${errorDescription}`);
    });
  });
};

export const publish = async (argv: string[]) => {
  const args = arg(
    {
      "--all": Boolean,
      "--force": Boolean,
      "-f": "--force",
    },
    { argv },
  );

  const qiitaApi = await getQiitaApiInstance();
  const fileSystemRepo = await getFileSystemRepo();
  const slideFileSystemRepo = await getSlideFileSystemRepo();

  await syncArticlesFromQiita({ fileSystemRepo, qiitaApi });
  await syncSlidesFromQiita({ slideFileSystemRepo, qiitaApi });

  const { items: targetItems, slides: targetSlides } = args["--all"]
    ? await loadAllPublishTargets({ fileSystemRepo, slideFileSystemRepo })
    : await resolveTargetsByBasenames(args._, {
        fileSystemRepo,
        slideFileSystemRepo,
      });

  // Validate
  const force = args["--force"] ?? false;
  const invalidItemMessages = targetItems.reduce(
    (acc, item) => {
      const errors = validatePublishItem(item, { force });
      return errors.length > 0 ? [...acc, { name: item.name, errors }] : acc;
    },
    [] as { name: string; errors: string[] }[],
  );
  const invalidSlideMessages = targetSlides.reduce(
    (acc, slide) => {
      const errors = validatePublishSlide(slide, { force });
      return errors.length > 0 ? [...acc, { name: slide.name, errors }] : acc;
    },
    [] as { name: string; errors: string[] }[],
  );
  const invalidMessages = [...invalidItemMessages, ...invalidSlideMessages];
  if (invalidMessages.length > 0) {
    await printValidationErrors(invalidMessages);
    process.exit(1);
  }

  if (targetItems.length === 0 && targetSlides.length === 0) {
    console.log("Nothing to publish");
    process.exit(0);
  }

  const itemPromises = targetItems.map(async (item) => {
    const { item: responseItem, posted } = await fileSystemRepo.publishItem(
      item,
      qiitaApi,
    );

    console.log(
      `${posted ? "Posted" : "Updated"}: ${item.name} -> ${responseItem.id}`,
    );
  });

  const slidePromises = targetSlides.map(async (slide) => {
    const { slide: responseSlide, posted } =
      await slideFileSystemRepo.publishSlide(slide, qiitaApi);

    console.log(
      `${posted ? "Posted" : "Updated"} (slide): ${slide.name} -> ${responseSlide.uuid}`,
    );
  });

  try {
    await Promise.all([...itemPromises, ...slidePromises]);
  } catch (err) {
    if (err instanceof QiitaForbiddenError) {
      // patchItem, postItem, patchSlide and postSlide are possible to return 403 by bad request.
      throw new QiitaForbiddenOrBadRequestError(err.message, { cause: err });
    }
    throw err;
  }
  console.log("Successful!");
};
