import type Express from "express";
import { Router } from "express";
import { checkFrontmatterType } from "../../lib/check-frontmatter-type";
import { getFileSystemRepo } from "../../lib/get-file-system-repo";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { validateItem } from "../../lib/validators/item-validator";
import type {
  ItemViewModel,
  ItemsIndexViewModel,
  ItemsShowViewModel,
} from "../../lib/view-models/items";
import { Item } from "../../qiita-api";
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
        parent: item.name.split("/").slice(0, -1),
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
    },
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

  const { itemPath, modified, published } = item;

  const qiitaApi = await getQiitaApiInstance();
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

  const result: ItemsShowViewModel = {
    error_messages: errorMessages,
    is_older_than_remote: item.isOlderThanRemote,
    item_path: itemPath,
    modified,
    organization_url_name: item.organizationUrlName,
    secret: item.secret,
    published,
    qiita_item_url: qiitaItemUrl,
    rendered_body: renderedBody,
    slide: item.slide,
    tags: item.tags,
    title: item.title,
  };
  res.json(result);
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

  const qiitaApi = await getQiitaApiInstance();
  const output: { [key: string]: string | boolean } = {
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
        slide: result.slide,
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
        slide: result.slide,
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
