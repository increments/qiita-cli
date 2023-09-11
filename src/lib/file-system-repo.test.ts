import matter from "gray-matter";
import fs from "node:fs/promises";
import { Item } from "../qiita-api";
import { FileSystemRepo } from "./file-system-repo";

jest.mock("node:fs/promises");

afterEach(() => {
  jest.clearAllMocks();
});

describe("FileSystemRepo", () => {
  describe("constructor", () => {
    it("creates", () => {
      const dataRootDir = "data_root_dir";
      const subject = () => {
        return new FileSystemRepo({ dataRootDir });
      };
      expect(subject()).toBeInstanceOf(FileSystemRepo);
    });
  });

  describe("loadItemByItemId()", () => {
    it("returns item", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);

      const dataRootDir = "data_root_dir";
      const subDir = "public";
      const instance = new FileSystemRepo({ dataRootDir });
      const itemId = "abc";
      const subject = () => {
        return instance.loadItemByItemId(itemId);
      };

      expect(mockFs.readdir.mock.calls).toHaveLength(0);
      return subject().then((item) => {
        expect(item).toBeNull();
        expect(mockFs.readdir.mock.calls).toHaveLength(1);
        expect(mockFs.readdir.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}`
        );
      });
    });

    describe("when found item", () => {
      it("returns item", () => {
        const dataRootDir = "data_root_dir";
        const subDir = "public";
        const instance = new FileSystemRepo({ dataRootDir });
        const itemId = "abc";
        const subject = () => {
          return instance.loadItemByItemId(itemId);
        };

        const mockFs = fs as jest.Mocked<typeof fs>;
        // cast any why jest.mock cannot treat overloaded type. they resolve forcefully last one.
        const filename = "something.md";
        mockFs.readdir.mockResolvedValueOnce([filename] as any[]);
        mockFs.readFile.mockResolvedValue(`---
id: ${itemId}
tags: []
---`);

        expect(mockFs.readdir.mock.calls).toHaveLength(0);
        return subject().then((item) => {
          expect(item?.id).toBe(itemId);
          expect(mockFs.readdir.mock.calls).toHaveLength(1);
          expect(mockFs.readdir.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}`
          );
          expect(mockFs.readFile.mock.calls).toHaveLength(2);
          expect(mockFs.readFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/${filename}`
          );
          expect(mockFs.readFile.mock.calls[1][0]).toBe(
            `${dataRootDir}/${subDir}/.remote/${itemId}.md`
          );
        });
      });
    });
  });

  describe("loadItemByBasename()", () => {
    it("returns item", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);

      const dataRootDir = "data_root_dir";
      const subDir = "public";
      const instance = new FileSystemRepo({ dataRootDir });
      const basename = "abc";
      const subject = () => {
        return instance.loadItemByBasename(basename);
      };

      expect(mockFs.readdir.mock.calls).toHaveLength(0);
      return subject().then((item) => {
        expect(item).toBeNull();
        expect(mockFs.readdir.mock.calls).toHaveLength(1);
        expect(mockFs.readdir.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}`
        );
      });
    });

    describe("when found item", () => {
      it("returns item", () => {
        const dataRootDir = "data_root_dir";
        const subDir = "public";
        const instance = new FileSystemRepo({ dataRootDir });
        const basename = "abc";
        const subject = () => {
          return instance.loadItemByBasename(basename);
        };

        const mockFs = fs as jest.Mocked<typeof fs>;
        // cast any why jest.mock cannot treat overloaded type. they resolve forcefully last one.
        mockFs.readdir.mockResolvedValueOnce([`${basename}.md`] as any[]);
        const id = "this_is_id";
        mockFs.readFile.mockResolvedValue(`---
id: ${id}
tags: []
---`);

        expect(mockFs.readdir.mock.calls).toHaveLength(0);
        return subject().then((item) => {
          expect(item?.id).toBe(id);
          expect(mockFs.readdir.mock.calls).toHaveLength(1);
          expect(mockFs.readdir.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}`
          );
          expect(mockFs.readFile.mock.calls).toHaveLength(2);
          expect(mockFs.readFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/${basename}.md`
          );
          expect(mockFs.readFile.mock.calls[1][0]).toBe(
            `${dataRootDir}/${subDir}/.remote/${id}.md`
          );
        });
      });
    });
  });

  describe("loadItems", () => {
    describe("when items does not exist", () => {
      it("returns empty", () => {
        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockImplementation(async (path) => {
          switch (path) {
            case `${dataRootDir}/${subDir}`:
              return [];
            default:
              throw new Error(`Unexpected path: ${path}`);
          }
        });

        const dataRootDir = "data_root_dir";
        const subDir = "public";
        const instance = new FileSystemRepo({ dataRootDir });
        const subject = () => {
          return instance.loadItems();
        };

        return subject().then((items) => {
          expect(items).toStrictEqual([]);
        });
      });
    });

    describe("when items exists", () => {
      it("returns items", () => {
        const dataRootDir = "data_root_dir";
        const subDir = "public";
        const instance = new FileSystemRepo({ dataRootDir });
        const subject = () => {
          return instance.loadItems();
        };

        const generateItem = (suffix: string) => {
          return {
            basename: "basename_" + suffix,
            id: "id_" + suffix,
            content: `---
id: id_${suffix}
tags: []
slide: false
---`,
          };
        };
        const item_a = generateItem("a");
        const item_b = generateItem("b");

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockImplementation(async (path) => {
          switch (path) {
            case `${dataRootDir}/${subDir}`:
              return [
                `${item_a.basename}.md`,
                `${item_b.basename}.md`,
              ] as any[]; // cast any why jest.mock cannot treat overloaded type. they resolve forcefully last one.
            default:
              throw new Error(`Unexpected path: ${path}`);
          }
        });
        mockFs.readFile.mockImplementation(async (path) => {
          switch (path) {
            case `${dataRootDir}/${subDir}/${item_a.basename}.md`:
            case `${dataRootDir}/${subDir}/.remote/${item_a.id}.md`:
              return item_a.content;
            case `${dataRootDir}/${subDir}/${item_b.basename}.md`:
            case `${dataRootDir}/${subDir}/.remote/${item_b.id}.md`:
              return item_b.content;
            default:
              throw new Error(`Unexpected path: ${path}`);
          }
        });

        return subject().then((items) => {
          expect(items.map((item) => item?.id)).toStrictEqual([
            item_a.id,
            item_b.id,
          ]);
        });
      });
    });
  });

  describe("createItem()", () => {
    describe("when basename is not given", () => {
      it("saves item", () => {
        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([]);
        mockFs.writeFile.mockResolvedValueOnce();

        const dataRootDir = "data_root_dir";
        const subDir = "public";
        const instance = new FileSystemRepo({ dataRootDir });
        const subject = () => {
          return instance.createItem();
        };

        return subject().then(() => {
          expect(mockFs.readdir.mock.calls).toHaveLength(2);
          expect(mockFs.writeFile.mock.calls).toHaveLength(1);
          expect(mockFs.writeFile.mock.calls[0]).toHaveLength(3);
          expect(mockFs.writeFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/newArticle001.md`
          );
          const { data } = matter(mockFs.writeFile.mock.calls[0][1] as string);
          expect(data.id).toBeNull();
        });
      });
    });

    describe("when basename is given", () => {
      it("saves item", () => {
        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([]);
        mockFs.writeFile.mockResolvedValueOnce();

        const dataRootDir = "data_root_dir";
        const subDir = "public";
        const instance = new FileSystemRepo({ dataRootDir });
        const subject = () => {
          return instance.createItem("test01");
        };

        return subject().then(() => {
          expect(mockFs.readdir.mock.calls).toHaveLength(1);
          expect(mockFs.writeFile.mock.calls).toHaveLength(1);
          expect(mockFs.writeFile.mock.calls[0]).toHaveLength(3);
          expect(mockFs.writeFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/test01.md`
          );
          const { data } = matter(mockFs.writeFile.mock.calls[0][1] as string);
          expect(data.id).toBeNull();
        });
      });
    });
  });

  describe("saveItem()", () => {
    const id = "this_is_id";
    const dataRootDir = "data_root_dir";
    const subDir = "public";
    const instance = new FileSystemRepo({ dataRootDir });
    const item: Item = {
      body: "test",
      id,
      private: false,
      coediting: false,
      tags: [],
      title: "title",
      created_at: "",
      updated_at: "",
      organization_url_name: null,
      slide: false,
      draft: false,
    };
    const remoteFilename = `${id}.md`;
    const localFilename = remoteFilename;
    const itemBody = `---
title: ${item.title}
tags: []
id: ${item.id}
---
${item.body}
`;
    const updatedItemBody = `---
title: ${item.title}
tags: []
id: ${item.id}
---
updated
`;
    const subject = (
      beforeSync: boolean = false,
      forceUpdate: boolean = false
    ) => {
      return instance.saveItem(item, beforeSync, forceUpdate);
    };

    describe("when local article does not exist", () => {
      it("saves item local and remote", () => {
        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([]);
        mockFs.writeFile.mockResolvedValue();
        mockFs.readFile.mockResolvedValue(itemBody);

        return subject().then(() => {
          expect(mockFs.readFile.mock.calls).toHaveLength(1);
          expect(mockFs.writeFile.mock.calls).toHaveLength(2);
          expect(mockFs.writeFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/.remote/${remoteFilename}`
          );
          expect(mockFs.writeFile.mock.calls[1][0]).toBe(
            `${dataRootDir}/${subDir}/${localFilename}`
          );
        });
      });
    });

    describe("when local article exists", () => {
      it("saves item remote", () => {
        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([remoteFilename] as any[]);
        mockFs.writeFile.mockResolvedValue();
        mockFs.readFile.mockResolvedValueOnce(itemBody);
        mockFs.readFile.mockResolvedValue(updatedItemBody);

        return subject().then(() => {
          expect(mockFs.readFile.mock.calls).toHaveLength(3);
          expect(mockFs.writeFile.mock.calls).toHaveLength(1);
          expect(mockFs.writeFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/.remote/${remoteFilename}`
          );
        });
      });

      describe("when beforeSync is true", () => {
        it("saves item remote", () => {
          const mockFs = fs as jest.Mocked<typeof fs>;
          mockFs.readdir.mockResolvedValueOnce([remoteFilename] as any[]);
          mockFs.writeFile.mockResolvedValue();
          mockFs.readFile.mockResolvedValueOnce(itemBody);
          mockFs.readFile.mockResolvedValue(updatedItemBody);

          return subject(true).then(() => {
            expect(mockFs.readFile.mock.calls).toHaveLength(3);
            expect(mockFs.writeFile.mock.calls).toHaveLength(2);
            expect(mockFs.writeFile.mock.calls[0][0]).toBe(
              `${dataRootDir}/${subDir}/.remote/${remoteFilename}`
            );
            expect(mockFs.writeFile.mock.calls[1][0]).toBe(
              `${dataRootDir}/${subDir}/.remote/${remoteFilename}`
            );
          });
        });
      });

      describe("when forceUpdate is true", () => {
        it("saves item local and remote", () => {
          const mockFs = fs as jest.Mocked<typeof fs>;
          mockFs.readdir.mockResolvedValueOnce([localFilename] as any[]);
          mockFs.readdir.mockResolvedValue([remoteFilename] as any[]);
          mockFs.writeFile.mockResolvedValue();
          mockFs.readFile.mockResolvedValueOnce(itemBody);
          mockFs.readFile.mockResolvedValue(updatedItemBody);

          return subject(false, true).then(() => {
            expect(mockFs.readFile.mock.calls).toHaveLength(3);
            expect(mockFs.writeFile.mock.calls).toHaveLength(2);
            expect(mockFs.writeFile.mock.calls[0][0]).toBe(
              `${dataRootDir}/${subDir}/.remote/${remoteFilename}`
            );
            expect(mockFs.writeFile.mock.calls[1][0]).toBe(
              `${dataRootDir}/${subDir}/${localFilename}`
            );
          });
        });
      });
    });
  });
});
