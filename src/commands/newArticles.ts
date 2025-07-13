import arg from "arg";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { validateFilename } from "../lib/filename-validator";

export const newArticles = async (argv: string[]) => {
  const args = arg({}, { argv });

  const fileSystemRepo = await getFileSystemRepo();

  if (args._.length > 0) {
    for (const basename of args._) {
      const validation = validateFilename(basename);
      if (!validation.isValid) {
        console.error(`Error: ${validation.error}`);
        continue;
      }

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
