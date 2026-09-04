import type Express from "express";
import { Router } from "express";
import { checkSlideFrontmatterType } from "../../lib/check-slide-frontmatter-type";
import { getSlideFileSystemRepo } from "../../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { validateSlide } from "../../lib/validators/slide-validator";
import type {
  SlideViewModel,
  SlidesIndexViewModel,
  SlidesShowViewModel,
} from "../../lib/view-models/slides";

const slidesIndex = async (req: Express.Request, res: Express.Response) => {
  const slideFileSystemRepo = await getSlideFileSystemRepo();

  const slideData = await slideFileSystemRepo.loadSlides();

  const result: SlidesIndexViewModel = slideData.reduce(
    (prev, slide) => {
      const resultSlide: SlideViewModel = {
        id: slide.id,
        name: slide.name,
        title: slide.title,
        updated_at: slide.updatedAt,
        slides_show_path: slide.slidesShowPath,
        published: slide.published,
      };

      if (slide.published) {
        prev.published.push(resultSlide);
      } else {
        prev.draft.push(resultSlide);
      }
      return prev;
    },
    {
      draft: [] as SlideViewModel[],
      published: [] as SlideViewModel[],
    },
  );

  res.json(result);
};

const slidesCreate = async (req: Express.Request, res: Express.Response) => {
  const slideFileSystemRepo = await getSlideFileSystemRepo();

  const basename = await slideFileSystemRepo.createSlide();

  res.json({ basename });
};

const slidesShow = async (req: Express.Request, res: Express.Response) => {
  const slideId = req.params.id;
  const basename = req.query.basename as string | undefined;

  const slideFileSystemRepo = await getSlideFileSystemRepo();

  const slide =
    slideId === "show" && basename
      ? await slideFileSystemRepo.loadSlideByBasename(basename)
      : await slideFileSystemRepo.loadSlideById(slideId);

  if (!slide) {
    res.status(404).json({
      message: "Not found",
    });
    return;
  }

  const errorFrontmatterMessages = checkSlideFrontmatterType(slide);
  if (errorFrontmatterMessages.length > 0) {
    res.status(500).json({
      errorMessages: errorFrontmatterMessages,
    });
    return;
  }

  const qiitaApi = await getQiitaApiInstance();
  const { pages, css } = await qiitaApi.previewSlide(slide.toPreviewMarkdown());

  const result: SlidesShowViewModel = {
    title: slide.title,
    pages,
    css,
    error_messages: validateSlide(slide),
    slides_show_path: slide.slidesShowPath,
    slide_path: slide.slidePath,
    published: slide.published,
    theme:
      typeof slide.marpFrontmatter.theme === "string"
        ? slide.marpFrontmatter.theme
        : null,
  };
  res.json(result);
};

export const SlidesRouter = Router()
  .get("/", slidesIndex)
  .post("/", slidesCreate)
  .get("/:id", slidesShow);
