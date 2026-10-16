import arg from "arg";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";

const createWithBasenames = async (
  basenames: string[],
  createItem: (basename?: string) => Promise<string | undefined>,
) => {
  if (basenames.length === 0) {
    const createdFileName = await createItem();
    if (createdFileName) {
      console.log(`created: ${createdFileName}.md`);
    } else {
      console.error("Error: failed to create");
    }
    return;
  }

  for (const basename of basenames) {
    const createdFileName = await createItem(basename);
    if (createdFileName) {
      console.log(`created: ${createdFileName}.md`);
    } else {
      console.error(`Error: '${basename}.md' is already exist`);
    }
  }
};

export const newArticles = async (argv: string[]) => {
  const args = arg(
    {
      "--slide": Boolean,
    },
    { argv },
  );

  if (args["--slide"]) {
    const slideFileSystemRepo = await getSlideFileSystemRepo();
    await createWithBasenames(args._, (basename) =>
      slideFileSystemRepo.createSlide(basename),
    );
  } else {
    const fileSystemRepo = await getFileSystemRepo();
    await createWithBasenames(args._, (basename) =>
      fileSystemRepo.createItem(basename),
    );
  }
};
