import arg from "arg";
import { getFileSystemRepo } from "../lib/get-file-system-repo";

export const newArticles = async (argv: string[]) => {
  const args = arg({}, { argv });

  const fileSystemRepo = await getFileSystemRepo();

  if (args._.length > 0) {
    for (const basename of args._) {
      const createdFileName = await fileSystemRepo.createItem(basename);
      if (createdFileName) {
        console.log(`created: ${createdFileName}.md`);
      } else {
        console.error(`Error: '${basename}.md' is already exist`);
      }
    }
  } else {
    const createdFileName = await fileSystemRepo.createItem();
    if (createdFileName) {
      console.log(`created: ${createdFileName}.md`);
    } else {
      console.error("Error: failed to create");
    }
  }
};
