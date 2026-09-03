import { css } from "@emotion/react";
import { useState, useEffect } from "react";
import { MaterialSymbol } from "./MaterialSymbol";
import { Link } from "react-router";
import { pointerFine } from "../lib/mixins";
import {
  Colors,
  getSpace,
  LineHeight,
  Typography,
  Weight,
} from "../lib/variables";
import { SlideViewModel } from "../../lib/view-models/slides";
import { SortType } from "./SidebarArticles";

interface Props {
  slides: SlideViewModel[];
  sortType: (typeof SortType)[keyof typeof SortType];
  slideState: "Draft" | "Published";
}

const SlideState = {
  Draft: "未投稿",
  Published: "投稿済み",
};
const StorageName = {
  Draft: "openDraftSlidesState",
  Published: "openPublishedSlidesState",
};

export const SidebarSlides = ({ slides, sortType, slideState }: Props) => {
  const compare = {
    [SortType.ByUpdatedAt]: (a: SlideViewModel, b: SlideViewModel) => {
      if (!a.updated_at) return -1;
      if (!b.updated_at) return 1;
      return b.updated_at.localeCompare(a.updated_at);
    },
    [SortType.Alphabetically]: (a: SlideViewModel, b: SlideViewModel) => {
      return a.title.localeCompare(b.title);
    },
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(
    localStorage.getItem(StorageName[slideState]) === "true",
  );

  const toggleAccordion = (event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsDetailsOpen((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem(StorageName[slideState], isDetailsOpen.toString());
  }, [isDetailsOpen, slideState]);

  return (
    <details css={slideDetailsStyle} open={isDetailsOpen}>
      <summary css={slideSummaryStyle} onClick={toggleAccordion}>
        {SlideState[slideState]}
        <span css={slideSectionTitleCountStyle}>{slides.length}</span>
      </summary>
      <ul css={slideDetailsListStyle}>
        {[...slides].sort(compare[sortType]).map((slide) => (
          <li key={slide.slides_show_path}>
            <Link css={slidesListItemStyle} to={slide.slides_show_path}>
              <MaterialSymbol>slideshow</MaterialSymbol>
              <span css={slideListItemInnerStyle}>{slide.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
};

const slideDetailsStyle = css({
  "& > summary::before": {
    fontFamily: "Material Symbols Outlined",
    content: "'expand_less'",
  },

  "&[open] > summary::before": {
    content: "'expand_more'",
  },
});

const slideDetailsListStyle = css({
  listStyle: "none",
  margin: 0,
  paddingLeft: getSpace(1),
});

const slideSummaryStyle = css({
  alignItems: "center",
  backgroundColor: "transparent",
  color: Colors.mediumEmphasis,
  cursor: "pointer",
  display: "flex",
  fontWeight: Weight.bold,
  fontSize: Typography.body2,
  gap: getSpace(1),
  padding: `${getSpace(1 / 2)}px ${getSpace(2)}px`,
  width: "100%",
  boxSizing: "border-box",

  ...pointerFine({
    "&:hover": {
      backgroundColor: Colors.gray10,
      cursor: "pointer",
      textDecoration: "none",
    },
  }),

  "&::-webkit-details-marker": {
    display: "none",
  },
});

const slideSectionTitleCountStyle = css({
  backgroundColor: Colors.gray20,
  borderRadius: 4,
  fontSize: Typography.body3,
  lineHeight: LineHeight.bodyDense,
  padding: `0 ${getSpace(1 / 2)}px`,
});

const slidesListItemStyle = css({
  alignItems: "center",
  backgroundColor: "transparent",
  color: Colors.mediumEmphasis,
  display: "flex",
  fontSize: Typography.body2,
  gap: getSpace(1),
  lineHeight: LineHeight.bodyDense,
  padding: `${getSpace(3 / 4)}px ${getSpace(5 / 2)}px ${getSpace(3 / 4)}px ${getSpace(
    3,
  )}px`,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",

  ...pointerFine({
    "&:hover": {
      backgroundColor: Colors.gray10,
      textDecoration: "none",
    },
  }),
});

const slideListItemInnerStyle = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
