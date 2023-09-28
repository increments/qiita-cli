import { css } from "@emotion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { itemsIndexPath } from "../../lib/qiita-cli-url";
import { ItemsIndexViewModel } from "../../lib/view-models/items";
import { breakpoint, pointerFine, viewport } from "../lib/mixins";
import {
  Colors,
  LineHeight,
  Typography,
  Weight,
  getSpace,
} from "../lib/variables";
import { useWindowSize } from "../lib/window-size";
import { useHotReloadEffect } from "./HotReloadRoot";
import { QiitaLogo, QiitaPreviewLogo } from "./Logo";
import { MaterialSymbol } from "./MaterialSymbol";
import { SidebarArticles, SortType } from "./SidebarArticles";
import { Tooltip } from "./Tooltip";

interface Props {
  isStateOpen: boolean;
  handleMobileClose?: () => void;
}

type SortType = (typeof SortType)[keyof typeof SortType];

export const SidebarContents = ({ isStateOpen, handleMobileClose }: Props) => {
  const [items, setItems] = useState<ItemsIndexViewModel>();
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("openSidebarState") === "true",
  );

  const [sortType, setSortType] = useState<SortType>(SortType.ByUpdatedAt);

  const imageUploadUrl = "https://qiita.com/settings/image_upload";

  useHotReloadEffect(() => {
    fetch("/api/items").then((result) => {
      result.json().then((data) => {
        setItems(data);
      });
    });
  }, []);

  const sortTypeName = {
    [SortType.ByUpdatedAt]: "新着順",
    [SortType.Alphabetically]: "アルファベット順",
  };

  const handleNew = () => {
    fetch("/api/items", {
      method: "POST",
    }).then((response) => {
      response.json().then((data) => {
        const params = new URLSearchParams(location.search);
        params.set("basename", data.basename);
        const url = new URL("/items/show", location.href);
        url.search = params.toString();
        location.href = url.toString();
      });
    });
  };

  const handleOpen = () => {
    localStorage.setItem("openSidebarState", "true");
    setIsOpen(true);
  };

  const handleClose = () => {
    localStorage.setItem("openSidebarState", "false");
    setIsOpen(false);
  };

  const { currentWidth } = useWindowSize();
  const isMobile = currentWidth <= breakpoint.S;

  return isMobile ? (
    <div css={mobileSidebarStyle(isStateOpen)}>
      <header css={headerStyle}>
        <h1 css={headerLogoWrapperStyle}>
          <Link to={itemsIndexPath()}>
            <QiitaPreviewLogo css={headerLogoStyle} />
          </Link>
        </h1>
        <button
          aria-label="サイドバーを閉じる"
          onClick={handleMobileClose}
          css={mobileSidebarButtonStyle}
        >
          <MaterialSymbol size={24}>close</MaterialSymbol>
        </button>
      </header>

      <nav css={articlesContainerStyle}>
        <ul>
          <li>
            <a
              href={imageUploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              css={articlesListItemStyle}
            >
              <MaterialSymbol css={{ color: Colors.disabled }}>
                panorama
              </MaterialSymbol>
              <span css={articleListItemImageUploadStyle}>
                画像をアップロードする
                <MaterialSymbol size={14} css={{ color: Colors.disabled }}>
                  open_in_new
                </MaterialSymbol>
              </span>
            </a>
          </li>
          <li>
            <button css={articlesListItemStyle} onClick={handleNew}>
              <MaterialSymbol css={{ color: Colors.disabled }}>
                add
              </MaterialSymbol>
              新規記事作成
            </button>
          </li>
        </ul>
        <div css={articlesStyle}>
          <div css={articlesHeaderStyle}>
            <h1 css={articlesHeaderTitleStyle}>Articles</h1>
            <div css={articlesHeaderSortStyle}>
              <MaterialSymbol css={articlesHeaderSortIconStyle}>
                sort
              </MaterialSymbol>
              <select
                css={articlesHeaderSortButtonStyle}
                onChange={(e) =>
                  setSortType(parseInt(e.currentTarget.value) as SortType)
                }
              >
                {Object.values(SortType).map((sortType) => (
                  <option value={sortType} key={`sortType-${sortType}`}>
                    {sortTypeName[sortType]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            {items && (
              <>
                <SidebarArticles
                  items={items.draft}
                  sortType={sortType}
                  articleState={"Draft"}
                />
                <SidebarArticles
                  items={items.public}
                  sortType={sortType}
                  articleState={"Public"}
                />
                <SidebarArticles
                  items={items.private}
                  sortType={sortType}
                  articleState={"Private"}
                />
              </>
            )}
          </div>
        </div>
      </nav>
      <footer css={articleFooterStyle}>
        <a
          css={articleFooterTitleStyle}
          href="https://qiita.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <QiitaLogo css={{ height: 16 }} />
        </a>
        <ul css={articleFooterListStyle}>
          <li>
            <Link css={articlesListItemStyle} to={"/"}>
              <MaterialSymbol css={{ color: Colors.disabled }}>
                book
              </MaterialSymbol>
              Readme
            </Link>
          </li>
          <li>
            <a
              css={articlesListItemStyle}
              href="https://help.qiita.com/ja/articles/qiita-article-guideline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MaterialSymbol css={{ color: Colors.disabled }}>
                lightbulb
              </MaterialSymbol>
              良い記事を書くためのガイドライン
            </a>
          </li>
          <li>
            <a
              css={articlesListItemStyle}
              href="https://qiita.com/Qiita/items/c686397e4a0f4f11683d"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MaterialSymbol css={{ color: Colors.disabled }}>
                help
              </MaterialSymbol>
              Markdown記法チートシート - Qiita
            </a>
          </li>
        </ul>
        <ul css={[articleFooterListStyle, { padding: `0 ${getSpace(2)}px` }]}>
          <li>
            <a
              css={articleFooterListItemStyle}
              href="https://help.qiita.com/ja/articles/qiita-community-guideline"
              target="_blank"
              rel="noopener noreferrer"
            >
              コミュニティガイドライン
              <MaterialSymbol css={{ color: Colors.disabled }}>
                open_in_new
              </MaterialSymbol>
            </a>
          </li>
          <li>
            <a
              css={articleFooterListItemStyle}
              href="https://qiita.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              利用規約
              <MaterialSymbol css={{ color: Colors.disabled }}>
                open_in_new
              </MaterialSymbol>
            </a>
          </li>
          <li>
            <a
              css={articleFooterListItemStyle}
              href="https://qiita.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              プライバシーポリシー
              <MaterialSymbol css={{ color: Colors.disabled }}>
                open_in_new
              </MaterialSymbol>
            </a>
          </li>
        </ul>
      </footer>
    </div>
  ) : isOpen ? (
    <div css={sidebarStyle}>
      <header css={headerStyle}>
        <h1 css={headerLogoWrapperStyle}>
          <Link to={itemsIndexPath()}>
            <QiitaPreviewLogo css={headerLogoStyle} />
          </Link>
        </h1>
        <Tooltip
          message={"サイドバーを閉じる"}
          vertical="bottom"
          horizontal="left"
          offset={4}
        >
          <button
            aria-label="サイドバーを閉じる"
            css={toggleButtonStyle}
            onClick={handleClose}
          >
            <MaterialSymbol size={24}>chevron_left</MaterialSymbol>
          </button>
        </Tooltip>
      </header>

      <nav css={articlesContainerStyle}>
        <ul>
          <li>
            <a
              href={imageUploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              css={articlesListItemStyle}
            >
              <MaterialSymbol css={{ color: Colors.disabled }}>
                panorama
              </MaterialSymbol>
              <span css={articleListItemImageUploadStyle}>
                画像をアップロードする
                <MaterialSymbol size={14} css={{ color: Colors.disabled }}>
                  open_in_new
                </MaterialSymbol>
              </span>
            </a>
          </li>
          <li>
            <button css={articlesListItemStyle} onClick={handleNew}>
              <MaterialSymbol css={{ color: Colors.disabled }}>
                add
              </MaterialSymbol>
              新規記事作成
            </button>
          </li>
        </ul>
        <div css={articlesStyle}>
          <div css={articlesHeaderStyle}>
            <h1 css={articlesHeaderTitleStyle}>Articles</h1>
            <div css={articlesHeaderSortStyle}>
              <MaterialSymbol css={articlesHeaderSortIconStyle}>
                sort
              </MaterialSymbol>
              <select
                css={articlesHeaderSortButtonStyle}
                onChange={(e) =>
                  setSortType(parseInt(e.currentTarget.value) as SortType)
                }
              >
                {Object.values(SortType).map((sortType) => (
                  <option value={sortType} key={`sortType-${sortType}`}>
                    {sortTypeName[sortType]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            {items && (
              <>
                <SidebarArticles
                  items={items.draft}
                  sortType={sortType}
                  articleState={"Draft"}
                />
                <SidebarArticles
                  items={items.public}
                  sortType={sortType}
                  articleState={"Public"}
                />
                <SidebarArticles
                  items={items.private}
                  sortType={sortType}
                  articleState={"Private"}
                />
              </>
            )}
          </div>
        </div>
      </nav>
      <footer css={articleFooterStyle}>
        <a
          css={articleFooterTitleStyle}
          href="https://qiita.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <QiitaLogo css={{ height: 16 }} />
        </a>
        <ul css={articleFooterListStyle}>
          <li>
            <Link css={articlesListItemStyle} to={"/"}>
              <MaterialSymbol css={{ color: Colors.disabled }}>
                book
              </MaterialSymbol>
              Readme
            </Link>
          </li>
          <li>
            <a
              css={articlesListItemStyle}
              href="https://help.qiita.com/ja/articles/qiita-article-guideline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MaterialSymbol css={{ color: Colors.disabled }}>
                lightbulb
              </MaterialSymbol>
              良い記事を書くためのガイドライン
            </a>
          </li>
          <li>
            <a
              css={articlesListItemStyle}
              href="https://qiita.com/Qiita/items/c686397e4a0f4f11683d"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MaterialSymbol css={{ color: Colors.disabled }}>
                help
              </MaterialSymbol>
              Markdown記法チートシート - Qiita
            </a>
          </li>
        </ul>
        <ul css={[articleFooterListStyle, { padding: `0 ${getSpace(2)}px` }]}>
          <li>
            <a
              css={articleFooterListItemStyle}
              href="https://help.qiita.com/ja/articles/qiita-community-guideline"
              target="_blank"
              rel="noopener noreferrer"
            >
              コミュニティガイドライン
              <MaterialSymbol css={{ color: Colors.disabled }}>
                open_in_new
              </MaterialSymbol>
            </a>
          </li>
          <li>
            <a
              css={articleFooterListItemStyle}
              href="https://qiita.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              利用規約
              <MaterialSymbol css={{ color: Colors.disabled }}>
                open_in_new
              </MaterialSymbol>
            </a>
          </li>
          <li>
            <a
              css={articleFooterListItemStyle}
              href="https://qiita.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              プライバシーポリシー
              <MaterialSymbol css={{ color: Colors.disabled }}>
                open_in_new
              </MaterialSymbol>
            </a>
          </li>
        </ul>
      </footer>
    </div>
  ) : (
    <div css={closedSidebarStyle}>
      <div css={closedSidebarHeaderStyle}>
        <Tooltip
          message={"サイドバーを開く"}
          vertical="middle"
          horizontal="right"
          offset={-4}
        >
          <button
            aria-label="サイドバーを開く"
            css={toggleButtonStyle}
            onClick={handleOpen}
          >
            <MaterialSymbol size={24}>chevron_right</MaterialSymbol>
          </button>
        </Tooltip>
        <ul>
          <li>
            <Tooltip
              message={"画像をアップロードする"}
              vertical="middle"
              horizontal="right"
              offset={-4}
            >
              <a
                aria-label="画像をアップロードする"
                href={imageUploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                css={closeSidebarLinkStyle}
              >
                <MaterialSymbol size={24}>panorama</MaterialSymbol>
              </a>
            </Tooltip>
          </li>
          <li>
            <Tooltip
              message={"新規記事を作成する"}
              vertical="middle"
              horizontal="right"
              offset={-4}
            >
              <button
                aria-label="新規記事を作成する"
                css={closeSidebarLinkStyle}
                onClick={handleNew}
              >
                <MaterialSymbol size={24}>note_add</MaterialSymbol>
              </button>
            </Tooltip>
          </li>
        </ul>
      </div>
      <ul>
        <li>
          <Tooltip
            message={"Readme"}
            vertical="middle"
            horizontal="right"
            offset={-4}
          >
            <Link
              aria-label="Readme"
              css={closeSidebarFooterLinkStyle}
              to={"/"}
            >
              <MaterialSymbol>book</MaterialSymbol>
            </Link>
          </Tooltip>
        </li>
        <li>
          <Tooltip
            message={"良い記事を書くためのガイドライン"}
            vertical="middle"
            horizontal="right"
            offset={-4}
          >
            <a
              aria-label="良い記事を書くためのガイドライン"
              css={closeSidebarFooterLinkStyle}
              href="https://help.qiita.com/ja/articles/qiita-article-guideline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MaterialSymbol>lightbulb</MaterialSymbol>
            </a>
          </Tooltip>
        </li>
        <li>
          <Tooltip
            message={"Markdown記法チートシート"}
            vertical="middle"
            horizontal="right"
            offset={-4}
          >
            <a
              aria-label="Markdown記法チートシート - Qiita"
              css={closeSidebarFooterLinkStyle}
              href="https://qiita.com/Qiita/items/c686397e4a0f4f11683d"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MaterialSymbol>help</MaterialSymbol>
            </a>
          </Tooltip>
        </li>
      </ul>
    </div>
  );
};

const sidebarStyle = css({
  height: "100vh",
  width: 360,
  padding: `${getSpace(2)}px 0`,
  position: "sticky",
  top: 0,
  overflow: "auto",

  ...viewport.S({
    display: "none",
  }),
});

const mobileSidebarStyle = (isStateOpen: boolean) =>
  css({
    backgroundColor: Colors.gray0,
    display: isStateOpen ? "block" : "none",
    height: "100vh",
    overflowY: "auto",
    padding: `${getSpace(1)}px 0`,
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 10,
  });

const headerStyle = css({
  alignItems: "center",
  fontSize: Typography.subhead1,
  fontWeight: Weight.bold,
  padding: `0 ${getSpace(2)}px`,
  display: "flex",
  justifyContent: "space-between",
  gap: getSpace(2),
});

const headerLogoWrapperStyle = css({
  display: "flex",
});

const headerLogoStyle = css({
  height: 24,
});

const articlesContainerStyle = css({
  marginTop: getSpace(2),
});

const articlesStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: getSpace(1),
  marginTop: getSpace(2),
});

const articlesHeaderStyle = css({
  alignItems: "center",
  display: "flex",
  gap: getSpace(2),
  padding: `0 ${getSpace(2)}px`,
});

const articlesHeaderTitleStyle = css({
  fontWeight: Weight.bold,
});

const articlesHeaderSortStyle = css({
  color: Colors.mediumEmphasis,
  position: "relative",
});

const articlesHeaderSortIconStyle = css({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
});

const articlesHeaderSortButtonStyle = css({
  background: "transparent",
  color: Colors.mediumEmphasis,
  cursor: "pointer",
  fontSize: Typography.body2,
  lineHeight: 1.8,
  paddingLeft: getSpace(5 / 2),
  zIndex: 1,
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
  width: "100%",

  ...pointerFine({
    "&:hover": {
      backgroundColor: Colors.gray5,
      textDecoration: "none",
    },
  }),
});

const articleListItemImageUploadStyle = css({
  alignItems: "center",
  display: "flex",
});

const toggleButtonStyle = css({
  alignItems: "center",
  backgroundColor: Colors.onBackground,
  border: `solid 2px ${Colors.gray30}`,
  borderRadius: 4,
  display: "flex",
  justifyContent: "center",
  padding: getSpace(1 / 2),
  "&:hover": {
    backgroundColor: Colors.gray20,
  },
});

const articleFooterStyle = css({
  borderTop: `solid 1px ${Colors.divider}`,
  marginTop: getSpace(3),
  paddingTop: getSpace(2),
});

const articleFooterTitleStyle = css({
  display: "flex",
  padding: `0 ${getSpace(2)}px`,
});

const articleFooterListStyle = css({
  marginTop: getSpace(1),
});

const articleFooterListItemStyle = css({
  alignItems: "center",
  display: "flex",
  gap: getSpace(1),
  color: Colors.mediumEmphasis,
  fontSize: Typography.body3,
});

const closedSidebarStyle = css({
  alignItems: "center",
  backgroundColor: Colors.gray0,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  justifyContent: "space-between",
  maxWidth: 48,
  padding: `${getSpace(1)}px ${getSpace(1 / 2)}px ${getSpace(2)}px`,
  position: "sticky",
  top: 0,

  ...viewport.S({
    display: "none",
  }),
});

const closedSidebarHeaderStyle = css({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: getSpace(2),
});

const closeSidebarLinkStyle = css({
  backgroundColor: Colors.gray0,
  color: Colors.disabled,
  display: "flex",
  padding: `${getSpace(1 / 2)}px ${getSpace(1)}px`,
});

const closeSidebarFooterLinkStyle = css({
  color: Colors.disabled,
  display: "flex",
  padding: `${getSpace(1)}px ${getSpace(3 / 2)}px`,
});

const mobileSidebarButtonStyle = css({
  backgroundColor: "inherit",
  color: Colors.mediumEmphasis,
  display: "flex",
  padding: getSpace(5 / 4),
});
