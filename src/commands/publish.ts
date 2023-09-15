import arg from "arg";
import process from "node:process";
import { checkFrontmatterType } from "../lib/check-frontmatter-type";
import { QiitaItem } from "../lib/entities/qiita-item";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { validateItem } from "../lib/validators/item-validator";
import { Item } from "../qiita-api";

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

  await syncArticlesFromQiita({ fileSystemRepo, qiitaApi });

  let targetItems: QiitaItem[];
  if (args["--all"]) {
    targetItems = (await fileSystemRepo.loadItems()).filter((item) => {
      if (item.ignorePublish === true) return false;
      return item.modified || item.id === null;
    });
  } else {
    const items = [];
    for (const basename of args._) {
      const item = await fileSystemRepo.loadItemByBasename(basename);
      if (item === null) {
        console.error(`Error: '${basename}' is not found`);
        process.exit(1);
      }
      items.push(item);
    }
    targetItems = items;
  }

  // Validate
  const enableForcePublish = args["--force"];
  const invalidItemMessages = targetItems.reduce(
    (acc, item) => {
      const frontmatterErrors = checkFrontmatterType(item);
      if (frontmatterErrors.length > 0)
        return [...acc, { name: item.name, errors: frontmatterErrors }];

      const validationErrors = validateItem(item);
      if (validationErrors.length > 0)
        return [...acc, { name: item.name, errors: validationErrors }];

      if (!enableForcePublish && item.isOlderThanRemote) {
        return [
          ...acc,
          {
            name: item.name,
            errors: ["内容がQiita上の記事より古い可能性があります"],
          },
        ];
      }

      return acc;
    },
    [] as { name: string; errors: string[] }[],
  );
  if (invalidItemMessages.length > 0) {
    const chalk = (await import("chalk")).default;
    invalidItemMessages.forEach((msg) => {
      msg.errors.forEach((err) => {
        const errorName = chalk.red.bold(msg.name + ":");
        const errorDescription = chalk.red(err);
        console.error(`${errorName} ${errorDescription}`);
      });
    });

    process.exit(1);
  }

  if (targetItems.length === 0) {
    console.log("Nothing to publish");
    process.exit(0);
  }

  const promises = targetItems.map(async (item) => {
    let responseItem: Item;
    if (item.id) {
      responseItem = await qiitaApi.patchItem({
        rawBody: item.rawBody,
        tags: item.tags,
        title: item.title,
        uuid: item.id,
        isPrivate: item.secret,
        organizationUrlName: item.organizationUrlName,
        slide: item.slide,
      });

      console.log(`Updated: ${item.name} -> ${item.id}`);
    } else {
      responseItem = await qiitaApi.postItem({
        rawBody: item.rawBody,
        tags: item.tags,
        title: item.title,
        isPrivate: item.secret,
        organizationUrlName: item.organizationUrlName,
        slide: item.slide,
      });
      await fileSystemRepo.updateItemUuid(item.name, responseItem.id);

      console.log(`Posted: ${item.name} -> ${responseItem.id}`);
    }

    await fileSystemRepo.saveItem(responseItem, false, true);
  });

  await Promise.all(promises);
  console.log("Successful!");
};
