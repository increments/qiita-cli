import { css } from "@emotion/react";
import { useState, useEffect } from "react";
import { MaterialSymbol } from "./MaterialSymbol";
import { Link } from "react-router-dom";
import { pointerFine } from "../lib/mixins";
import {
  Colors,
  getSpace,
  LineHeight,
  Typography,
  Weight,
} from "../lib/variables";
import { ItemViewModel } from "../../lib/view-models/items";

interface Props {
  items: ItemViewModel[];
  sortType: (typeof SortType)[keyof typeof SortType];
  articleState: "Draft" | "Public" | "Private";
}

export const SortType = {
  ByUpdatedAt: 1,
  Alphabetically: 2,
} as const;

export const SidebarArticles = ({ items, sortType, articleState }: Props) => {
  const ArticleState = {
    Draft: "未投稿",
    Public: "投稿済み",
    Private: "限定共有記事",
  };
  const StorageName = {
    Draft: "openDraftArticlesState",
    Public: "openPublicArticlesState",
    Private: "openPrivateArticlesState",
  };

  const compare = {
    [SortType.ByUpdatedAt]: (a: ItemViewModel, b: ItemViewModel) => {
      if (a.updated_at === "") return -1;
      if (b.updated_at === "") return 1;
      return b.updated_at.localeCompare(a.updated_at);
    },
    [SortType.Alphabetically]: (a: ItemViewModel, b: ItemViewModel) => {
      return a.title.localeCompare(b.title);
    },
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(
    localStorage.getItem(StorageName[articleState]) === "true",
  );

  const toggleAccordion = (event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsDetailsOpen((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem(StorageName[articleState], isDetailsOpen.toString());
  }, [isDetailsOpen]);

  return (
    <details css={articleDetailsStyle} open={isDetailsOpen}>
      <summary css={articleSummaryStyle} onClick={toggleAccordion}>
        {ArticleState[articleState]}
        <span css={articleSectionTitleCountStyle}>{items.length}</span>
      </summary>
      <ul>
        {items.sort(compare[sortType]).map((item) => (
          <li key={item.items_show_path}>
            <Link css={articlesListItemStyle} to={item.items_show_path}>
              <MaterialSymbol fill={item.modified && articleState !== "Draft"}>
                note
              </MaterialSymbol>
              <span css={articleListItemInnerStyle}>
                {item.modified && articleState !== "Draft" && "(差分あり) "}
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
};

const articleDetailsStyle = css({
  "& > summary::before": {
    fontFamily: "Material Symbols Outlined",
    content: "'expand_less'",
  },

  "&[open] > summary::before": {
    content: "'expand_more'",
  },
});

const articleSummaryStyle = css({
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
      backgroundColor: Colors.gray5,
      cursor: "pointer",
      textDecoration: "none",
    },
  }),

  "&::-webkit-details-marker": {
    display: "none",
  },
});

const articleSectionTitleCountStyle = css({
  backgroundColor: Colors.gray20,
  borderRadius: 4,
  fontSize: Typography.body3,
  lineHeight: LineHeight.bodyDense,
  padding: `0 ${getSpace(1 / 2)}px`,
});

const articlesListItemStyle = css({
  alignItems: "center",
  backgroundColor: "transparent",
  color: Colors.mediumEmphasis,
  display: "flex",
  fontSize: Typography.body2,
  gap: getSpace(1),
  lineHeight: LineHeight.bodyDense,
  padding: `${getSpace(3 / 4)}px ${getSpace(5 / 2)}px ${getSpace(
    3 / 4,
  )}px ${getSpace(3 / 2)}px`,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",

  ...pointerFine({
    "&:hover": {
      backgroundColor: Colors.gray5,
      textDecoration: "none",
    },
  }),
});

const articleListItemInnerStyle = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
