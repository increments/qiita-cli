import matter from "gray-matter";
import fs from "node:fs/promises";
import type { Slide } from "../qiita-api";
import { SlideFileSystemRepo } from "./slide-file-system-repo";

jest.mock("node:fs/promises");

afterEach(() => {
  jest.resetAllMocks();
});

const dataRootDir = "data_root_dir";
const rootPath = `${dataRootDir}/slides`;
const remotePath = `${rootPath}/.remote`;

// `description` is null and the body has no trailing newline: both are
// normalized away when the markdown is rebuilt, so this file must still
// count as identical to the mirror below.
const localFile = `---
title: Title
id: slide-uuid
updated_at: '2026-09-01T00:00:00+09:00'
description: null
marp: true
---
# Title`;

const mirrorFile = `---
title: Title
id: slide-uuid
updated_at: '2026-09-01T00:00:00+09:00'
description: ''
marp: true
---
# Title
`;

const buildRemoteSlide = (overrides: Partial<Slide> = {}): Slide => ({
  uuid: "slide-uuid",
  title: "Title",
  markdown: "---\nmarp: true\n---\n# Title\n",
  description_markdown: "",
  created_at: "2026-09-01T00:00:00+09:00",
  updated_at: "2026-09-01T00:00:00+09:00",
  url: "https://qiita.com/Qiita/slides/slide-uuid",
  ...overrides,
});

const mockFileSystem = (files: Record<string, string>) => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  mockFs.readdir.mockImplementation(async (dirPath) => {
    const prefix = `${dirPath}/`;
    return Object.keys(files)
      .filter((filePath) => filePath.startsWith(prefix))
      .map((filePath) => filePath.slice(prefix.length)) as any[];
  });
  mockFs.readFile.mockImplementation(async (filePath) => {
    const content = files[filePath as string];
    if (content === undefined) {
      throw new Error(`ENOENT: ${filePath}`);
    }
    return content;
  });
  mockFs.writeFile.mockImplementation(async (filePath, data) => {
    files[filePath as string] = data as string;
  });
  return files;
};

const writtenPaths = () =>
  (fs as jest.Mocked<typeof fs>).writeFile.mock.calls.map((call) =>
    String(call[0]),
  );

describe("SlideFileSystemRepo", () => {
  describe("constructor", () => {
    it("creates", () => {
      const dataRootDir = "data_root_dir";
      const subject = () => {
        return new SlideFileSystemRepo({ dataRootDir });
      };
      expect(subject()).toBeInstanceOf(SlideFileSystemRepo);
    });
  });

  describe("getRootPath()", () => {
    it("returns the root path", () => {
      const dataRootDir = "./tmp";
      const instance = new SlideFileSystemRepo({ dataRootDir });
      expect(instance.getRootPath()).toBe(`tmp/slides`);
    });
  });

  describe("loadSlideByBasename()", () => {
    it("returns null when not found", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);

      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });
      const basename = "abc";

      return instance.loadSlideByBasename(basename).then((slide) => {
        expect(slide).toBeNull();
        expect(mockFs.readdir.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}`,
        );
      });
    });

    describe("when found slide", () => {
      it("returns unpublished slide when id is null", () => {
        const dataRootDir = "data_root_dir";
        const subDir = "slides";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const basename = "abc";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([`${basename}.md`] as any[]);
        mockFs.readFile.mockResolvedValue(`---
title: Title
id: null
description: null
---
# Title`);

        return instance.loadSlideByBasename(basename).then((slide) => {
          expect(slide?.id).toBeNull();
          expect(slide?.published).toBe(false);
          expect(slide?.title).toBe("Title");
          expect(slide?.slidesShowPath).toBe(
            `/slides/show?basename=${basename}`,
          );
          expect(mockFs.readFile.mock.calls[0][0]).toBe(
            `${dataRootDir}/${subDir}/${basename}.md`,
          );
        });
      });

      it("forwards arbitrary marp frontmatter (beyond theme) to the slide markdown", () => {
        const dataRootDir = "data_root_dir";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const basename = "abc";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([`${basename}.md`] as any[]);
        mockFs.readFile.mockResolvedValue(`---
title: Title
id: null
description: null
theme: gaia
paginate: true
---
# Title`);

        return instance.loadSlideByBasename(basename).then((slide) => {
          const { data, content } = matter(slide!.toMarkdown());
          expect(data).toStrictEqual({ theme: "gaia", paginate: true });
          expect(content.trim()).toBe("# Title");
        });
      });

      it("returns published slide when id is present", () => {
        const dataRootDir = "data_root_dir";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const basename = "abc";
        const id = "this_is_id";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockResolvedValueOnce([`${basename}.md`] as any[]);
        mockFs.readFile.mockResolvedValue(`---
title: Title
id: ${id}
description: null
---
# Title`);

        return instance.loadSlideByBasename(basename).then((slide) => {
          expect(slide?.id).toBe(id);
          expect(slide?.published).toBe(true);
          expect(slide?.slidesShowPath).toBe(`/slides/${id}`);
        });
      });
    });
  });

  describe("loadSlideById()", () => {
    it("returns null when not found", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);

      const instance = new SlideFileSystemRepo({
        dataRootDir: "data_root_dir",
      });

      return instance.loadSlideById("missing-id").then((slide) => {
        expect(slide).toBeNull();
      });
    });

    describe("when found slide", () => {
      it("returns the slide matching the id", () => {
        const dataRootDir = "data_root_dir";
        const subDir = "slides";
        const instance = new SlideFileSystemRepo({ dataRootDir });
        const id = "this_is_id";

        const mockFs = fs as jest.Mocked<typeof fs>;
        mockFs.readdir.mockImplementation(async (path) => {
          switch (path) {
            case `${dataRootDir}/${subDir}`:
              return ["deck-a.md", "deck-b.md"] as any[];
            default:
              throw new Error(`Unexpected path: ${path}`);
          }
        });
        mockFs.readFile.mockImplementation(async (path) => {
          switch (path) {
            case `${dataRootDir}/${subDir}/deck-a.md`:
              return `---\ntitle: A\nid: other-id\ndescription: null\n---\nbody a`;
            case `${dataRootDir}/${subDir}/deck-b.md`:
              return `---\ntitle: B\nid: ${id}\ndescription: null\n---\nbody b`;
            default:
              throw new Error(`Unexpected path: ${path}`);
          }
        });

        return instance.loadSlideById(id).then((slide) => {
          expect(slide?.name).toBe("deck-b");
          expect(slide?.id).toBe(id);
        });
      });
    });
  });

  describe("loadSlides()", () => {
    it("returns empty when no slides exist", () => {
      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockImplementation(async (path) => {
        switch (path) {
          case `${dataRootDir}/${subDir}`:
            return [];
          default:
            throw new Error(`Unexpected path: ${path}`);
        }
      });

      return instance.loadSlides().then((slides) => {
        expect(slides).toStrictEqual([]);
      });
    });

    it("returns all slides", () => {
      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockImplementation(async (path) => {
        switch (path) {
          case `${dataRootDir}/${subDir}`:
            return ["deck-a.md", "deck-b.md"] as any[];
          default:
            throw new Error(`Unexpected path: ${path}`);
        }
      });
      mockFs.readFile.mockImplementation(async (path) => {
        switch (path) {
          case `${dataRootDir}/${subDir}/deck-a.md`:
            return `---\ntitle: A\nid: id-a\ndescription: null\n---\nbody a`;
          case `${dataRootDir}/${subDir}/deck-b.md`:
            return `---\ntitle: B\nid: id-b\ndescription: null\n---\nbody b`;
          default:
            throw new Error(`Unexpected path: ${path}`);
        }
      });

      return instance.loadSlides().then((slides) => {
        expect(slides.map((slide) => slide.id)).toStrictEqual(["id-a", "id-b"]);
      });
    });
  });

  describe("createSlide()", () => {
    it("saves slide with a default basename when basename is not given", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      // createSlide() reads the directory twice: once to pick a free
      // basename and once to check the basename is not taken.
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValueOnce();

      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      return instance.createSlide().then(() => {
        expect(mockFs.writeFile.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}/newSlide001.md`,
        );
        const { data } = matter(mockFs.writeFile.mock.calls[0][1] as string);
        expect(data.id).toBeNull();
      });
    });

    it("saves slide with the given basename", () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.readdir.mockResolvedValueOnce([]);
      mockFs.writeFile.mockResolvedValueOnce();

      const dataRootDir = "data_root_dir";
      const subDir = "slides";
      const instance = new SlideFileSystemRepo({ dataRootDir });

      return instance.createSlide("deck").then(() => {
        expect(mockFs.writeFile.mock.calls[0][0]).toBe(
          `${dataRootDir}/${subDir}/deck.md`,
        );
      });
    });
  });

  describe("with the .remote mirror", () => {
    describe("loadSlides()", () => {
      it("excludes the mirrored files from the slide list", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlides().then((slides) => {
          expect(slides.map((slide) => slide.name)).toStrictEqual(["deck"]);
        });
      });
    });

    describe("loadSlideByBasename()", () => {
      it("reports no diff when the local slide matches the mirror", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.modified).toBe(false);
          expect(slide?.isOlderThanRemote).toBe(false);
        });
      });

      it("reports a diff when the local body differs from the mirror", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace("# Title", "# Edited"),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.modified).toBe(true);
        });
      });

      it("reports a diff when a marp directive differs from the mirror", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace(
            "marp: true",
            "marp: true\ntheme: gaia",
          ),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.modified).toBe(true);
        });
      });

      it("reports being older than the remote when the mirror is newer", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile.replace(
            "2026-09-01",
            "2026-09-02",
          ),
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.loadSlideByBasename("deck").then((slide) => {
          expect(slide?.isOlderThanRemote).toBe(true);
        });
      });
    });

    describe("saveSlides()", () => {
      it("updates both the mirror and the local file when they match", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile,
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance
          .saveSlides([buildRemoteSlide({ title: "Renamed" })])
          .then(() => {
            expect(writtenPaths()).toStrictEqual([
              `${remotePath}/slide-uuid.md`,
              `${rootPath}/deck.md`,
            ]);
          });
      });

      it("updates only the mirror when the local file has local edits", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace("# Title", "# Edited"),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.saveSlides([buildRemoteSlide()]).then(() => {
          expect(writtenPaths()).toStrictEqual([`${remotePath}/slide-uuid.md`]);
        });
      });

      it("overwrites the local edits when forceUpdate is given", () => {
        mockFileSystem({
          [`${rootPath}/deck.md`]: localFile.replace("# Title", "# Edited"),
          [`${remotePath}/slide-uuid.md`]: mirrorFile,
        });
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.saveSlides([buildRemoteSlide()], true).then(() => {
          expect(writtenPaths()).toStrictEqual([
            `${remotePath}/slide-uuid.md`,
            `${rootPath}/deck.md`,
          ]);
        });
      });

      it("names a slide that has no local file after its uuid", () => {
        mockFileSystem({});
        const instance = new SlideFileSystemRepo({ dataRootDir });

        return instance.saveSlides([buildRemoteSlide()]).then(() => {
          expect(writtenPaths()).toStrictEqual([
            `${remotePath}/slide-uuid.md`,
            `${rootPath}/slide-uuid.md`,
          ]);
        });
      });
    });
  });
});
