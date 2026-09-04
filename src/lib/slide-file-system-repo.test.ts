import matter from "gray-matter";
import fs from "node:fs/promises";
import { SlideFileSystemRepo } from "./slide-file-system-repo";

jest.mock("node:fs/promises");

afterEach(() => {
  jest.clearAllMocks();
});

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

      it("forwards arbitrary marp frontmatter (beyond theme) to the preview markdown", () => {
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
          const { data, content } = matter(slide!.toPreviewMarkdown());
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
      mockFs.readdir.mockResolvedValueOnce([]);
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
});
