import type Express from "express";
import { Router } from "express";
import { config } from "../../lib/config";
import { getFileSystemRepo } from "../../lib/get-file-system-repo";
import { itemsShowPath } from "../../lib/qiita-cli-url";
import { validateItem } from "../../lib/validators/item-validator";
import type {
  ItemViewModel,
  ItemsIndexViewModel,
} from "../../lib/view-models/items";
import { Item, QiitaApi } from "../../qiita-api";
import { checkFrontmatterType } from "../../lib/check-frontmatter-type";
import { getCurrentUser } from "../lib/get-current-user";
import { itemUrl } from "../lib/qiita-url";

const itemsIndex = async (req: Express.Request, res: Express.Response) => {
  const fileSystemRepo = await getFileSystemRepo();

  const itemData = await fileSystemRepo.loadItems();

  const result: ItemsIndexViewModel = itemData.reduce(
    (prev, item) => {
      const resultItem = {
        id: item.id,
        items_show_path: item.itemsShowPath,
        secret: item.secret,
        title: item.title,
        updated_at: item.updatedAt,
        modified: item.modified,
      };

      if (item.id) {
        if (item.secret) {
          prev.private.push(resultItem);
        } else {
          prev.public.push(resultItem);
        }
      } else {
        prev.draft.push(resultItem);
      }
      return prev;
    },
    {
      private: [] as ItemViewModel[],
      draft: [] as ItemViewModel[],
      public: [] as ItemViewModel[],
    }
  );

  res.json(result);
};

const itemsShow = async (req: Express.Request, res: Express.Response) => {
  const itemId = req.params.id;
  const basename = req.query.basename as string | undefined;

  const fileSystemRepo = await getFileSystemRepo();

  const item =
    itemId === "show" && basename
      ? await fileSystemRepo.loadItemByBasename(basename)
      : await fileSystemRepo.loadItemByItemId(itemId);

  if (!item) {
    res.status(404).json({
      message: "Not found",
    });
    return;
  }

  const errorFrontmatterMessages = checkFrontmatterType(item);
  if (errorFrontmatterMessages.length > 0) {
    res.status(500).json({
      errorMessages: errorFrontmatterMessages,
    });
    return;
  }

  // const { data, itemPath, modified, published } = ;
  const { itemPath, modified, published } = item;

  const { accessToken } = await config.getCredential();
  const qiitaApi = new QiitaApi({ token: accessToken });
  const renderedBody = await qiitaApi.preview(item.rawBody);

  const currentUser = await getCurrentUser();
  const qiitaItemUrl = published
    ? itemUrl({
        id: item.id!,
        userId: currentUser.id,
        secret: item.secret,
      })
    : null;

  // validate
  const errorMessages = validateItem(item);

  res.json({
    title: item.title,
    tags: item.tags,
    private: item.secret,
    body: item.rawBody,
    organizationUrlName: item.organizationUrlName,
    renderedBody,
    itemPath,
    qiitaItemUrl,
    itemsShowPath: itemsShowPath(
      itemId,
      basename ? { basename: basename } : undefined
    ),
    modified,
    published,
    errorMessages,
  });
};

const itemsCreate = async (req: Express.Request, res: Express.Response) => {
  const fileSystemRepo = await getFileSystemRepo();

  const basename = await fileSystemRepo.createItem();

  res.json({ basename });
};

const itemsUpdate = async (req: Express.Request, res: Express.Response) => {
  const itemId = req.params.id;
  const basename: string | null = req.body.basename;

  const fileSystemRepo = await getFileSystemRepo();
  const result =
    itemId === "post" && basename
      ? await fileSystemRepo.loadItemByBasename(basename)
      : await fileSystemRepo.loadItemByItemId(itemId);

  if (!result) {
    res.status(404).json({
      message: "Not found",
    });
    return;
  }

  const { accessToken } = await config.getCredential();
  const qiitaApi = new QiitaApi({ token: accessToken });
  let output: { [key: string]: string | boolean } = {
    success: true,
    uuid: result.id || "",
  };
  let item: Item;
  try {
    if (!result.id && itemId === "post") {
      if (!basename) throw new Error("basename is undefined");

      item = await qiitaApi.postItem({
        rawBody: result.rawBody,
        tags: result.tags,
        title: result.title,
        isPrivate: result.secret,
        organizationUrlName: result.organizationUrlName,
      });
      if (item) {
        fileSystemRepo.updateItemUuid(basename, item.id);
        output.uuid = item.id;
      }
    } else if (result.id) {
      item = await qiitaApi.patchItem({
        rawBody: result.rawBody,
        tags: result.tags,
        title: result.title,
        uuid: result.id,
        isPrivate: result.secret,
        organizationUrlName: result.organizationUrlName,
      });
    } else {
      throw new Error("Unknown Error");
    }

    await fileSystemRepo.saveItem(item, false, true);
    res.json(output);
  } catch {
    res.json({
      success: false,
    });
  }
};

export const ItemsRouter = Router()
  .get("/", itemsIndex)
  .post("/", itemsCreate)
  .get("/:id", itemsShow)
  .post("/:id", itemsUpdate);
