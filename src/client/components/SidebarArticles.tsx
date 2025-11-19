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

  console.log(items);

  const rootGrouped: {
    [root: string]: {
      direct: ItemViewModel[];
      children: { [child: string]: ItemViewModel[] };
    };
  } = {};
  const topLevelItems: ItemViewModel[] = [];
  items.forEach((item) => {
    if (!item.parent || item.parent.length === 0) {
      topLevelItems.push(item);
    } else {
      const root = item.parent[0];
      const rest = item.parent.slice(1);
      const child = rest.length === 0 ? null : rest.join("/");
      if (!rootGrouped[root]) rootGrouped[root] = { direct: [], children: {} };
      if (child === null) {
        rootGrouped[root].direct.push(item);
      } else {
        if (!rootGrouped[root].children[child])
          rootGrouped[root].children[child] = [];
        rootGrouped[root].children[child].push(item);
      }
    }
  });

  return (
    <details css={articleDetailsStyle} open={isDetailsOpen}>
      <summary css={articleSummaryStyle} onClick={toggleAccordion}>
        {ArticleState[articleState]}
        <span css={articleSectionTitleCountStyle}>{items.length}</span>
      </summary>
      <ul>
        {topLevelItems.length > 0 &&
          topLevelItems.sort(compare[sortType]).map((item) => (
            <li key={item.items_show_path}>
              <Link css={articlesListItemStyle} to={item.items_show_path}>
                <MaterialSymbol
                  fill={item.modified && articleState !== "Draft"}
                >
                  note
                </MaterialSymbol>
                <span css={articleListItemInnerStyle}>
                  {item.modified && articleState !== "Draft" && "(差分あり) "}
                  {item.title}
                </span>
              </Link>
            </li>
          ))}

        {Object.entries(rootGrouped).map(([root, group]) => (
          <li key={root}>
            <details css={articleDetailsStyle} open>
              <summary css={articleSummaryStyle}>
                {root}
                <span css={articleSectionTitleCountStyle}>
                  {group.direct.length +
                    Object.values(group.children).reduce(
                      (s, arr) => s + arr.length,
                      0,
                    )}
                </span>
              </summary>
              <ul>
                {group.direct.length > 0 &&
                  group.direct.sort(compare[sortType]).map((item) => (
                    <li key={item.items_show_path}>
                      <Link
                        css={articlesListItemStyle}
                        to={item.items_show_path}
                      >
                        <MaterialSymbol
                          fill={item.modified && articleState !== "Draft"}
                        >
                          note
                        </MaterialSymbol>
                        <span css={articleListItemInnerStyle}>
                          {item.modified &&
                            articleState !== "Draft" &&
                            "(差分あり) "}
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}

                {Object.entries(group.children).map(
                  ([childPath, groupedItems]) => (
                    <li key={childPath}>
                      <details css={articleDetailsStyle} open>
                        <summary css={articleSummaryStyle}>
                          {childPath}
                          <span css={articleSectionTitleCountStyle}>
                            {groupedItems.length}
                          </span>
                        </summary>
                        <ul>
                          {groupedItems.sort(compare[sortType]).map((item) => (
                            <li key={item.items_show_path}>
                              <Link
                                css={articlesListItemStyle}
                                to={item.items_show_path}
                              >
                                <MaterialSymbol
                                  fill={
                                    item.modified && articleState !== "Draft"
                                  }
                                >
                                  note
                                </MaterialSymbol>
                                <span css={articleListItemInnerStyle}>
                                  {item.modified &&
                                    articleState !== "Draft" &&
                                    "(差分あり) "}
                                  {item.title}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ),
                )}
              </ul>
            </details>
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
  // nested lists: give visual indentation for hierarchy
  "& ul": {
    listStyle: "none",
    margin: 0,
    paddingLeft: 0,
  },
  "& ul ul": {
    paddingLeft: getSpace(4),
  },
  "& ul ul ul": {
    paddingLeft: getSpace(4),
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
      backgroundColor: Colors.gray10,
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

const articleListItemInnerStyle = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
