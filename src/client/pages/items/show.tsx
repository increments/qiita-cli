import { css } from "@emotion/react";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { apiItemsShowPath } from "../../../lib/qiita-cli-url";
import { Article } from "../../components/Article";
import { ArticleInfo } from "../../components/ArticleInfo";
import { Header } from "../../components/Header";
import { useHotReloadEffect } from "../../components/HotReloadRoot";
import { MaterialSymbol } from "../../components/MaterialSymbol";
import { SidebarContents } from "../../components/SidebarContents";
import { viewport } from "../../lib/mixins";
import {
  Colors,
  LineHeight,
  Typography,
  Weight,
  getSpace,
} from "../../lib/variables";
import { Contents } from "../../templates/Contents";
import { Main } from "../../templates/Main";
import { Sidebar } from "../../templates/Sidebar";

export const ItemsShow = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const basename = searchParams.get("basename");

  const [item, setItem] = useState<{
    body: string;
    renderedBody: string;
    private: boolean;
    tags: string[];
    title: string;
    itemPath: string;
    qiitaItemUrl: string | null;
    itemsShowPath: string;
    modified: boolean;
    published: boolean;
    organizationUrlName: string | null;
    errorMessages: string[];
  } | null>(null);

  const [error, setError] = useState<null | string>(null);
  const [errorFrontmatterMessages, setErrorFrontmatterMessages] = useState<
    null | string[]
  >(null);
  const [isStateOpen, setIsStateOpen] = useState(false);

  const handleMobileOpen = () => {
    setIsStateOpen(true);
  };

  const handleMobileClose = () => {
    setIsStateOpen(false);
  };

  useHotReloadEffect(() => {
    if (!id) return;
    const queryParams = basename ? { basename: basename } : undefined;
    const fetchURL = apiItemsShowPath(id, queryParams);

    fetch(fetchURL).then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          setError("ファイルが見つかりません");
          setItem(null);
        } else {
          response.json().then((data) => {
            setError(null);
            setErrorFrontmatterMessages(data.errorMessages);
            setItem(null);
          });
        }
      } else {
        response.json().then((data) => {
          setItem(data);
        });
      }
    });
  }, [id, basename]);

  return (
    <Main>
      <Sidebar>
        <SidebarContents
          isStateOpen={isStateOpen}
          handleMobileClose={handleMobileClose}
        />
      </Sidebar>

      <Contents>
        {id && item ? (
          <>
            <Header
              handleMobileOpen={handleMobileOpen}
              isItemPublishable={
                item.modified && item.errorMessages.length === 0
              }
              itemPath={item.itemPath}
              id={id}
              basename={basename}
            />
            <div css={contentsWrapperStyle}>
              <div css={contentsContainerStyle}>
                <ArticleInfo
                  secret={item.private}
                  modified={item.modified}
                  organizationUrlName={item.organizationUrlName}
                  published={item.published}
                  errorMessages={item.errorMessages}
                  qiitaItemUrl={item.qiitaItemUrl}
                />
                <div css={articleWrapStyle}>
                  <Article
                    renderedBody={item.renderedBody}
                    tags={item.tags}
                    title={item.title}
                  />
                </div>
              </div>
            </div>
          </>
        ) : error ? (
          <p css={errorMessageStyle}>{error}</p>
        ) : errorFrontmatterMessages && errorFrontmatterMessages.length > 0 ? (
          <div css={errorContentsStyle}>
            <p css={errorTitleStyle}>
              記事の設定の入力内容に誤りがあるため、プレビューが表示できません
            </p>
            {errorFrontmatterMessages.map((errorMessage, index) => (
              <p key={`error-message-${index}`} css={errorStyle}>
                <MaterialSymbol fill={true} css={exclamationIconStyle}>
                  error
                </MaterialSymbol>
                {errorMessage}
              </p>
            ))}
          </div>
        ) : null}
      </Contents>
    </Main>
  );
};

const contentsWrapperStyle = css({
  margin: `${getSpace(2)}px ${getSpace(2)}px 0`,
});

const contentsContainerStyle = css({
  backgroundColor: Colors.gray0,
  borderRadius: 8,
  maxWidth: 820,
  margin: "0 auto",
  padding: getSpace(3),
});

const articleWrapStyle = css({
  marginTop: getSpace(3),
});

const errorMessageStyle = css({
  fontSize: Typography.subhead2,
  padding: getSpace(2),
  textAlign: "center",
});

const errorContentsStyle = css({
  backgroundColor: Colors.red10,
  borderRadius: 8,
  fontSize: Typography.body2,
  lineHeight: LineHeight.bodyDense,
  margin: `${getSpace(3)}px auto 0`,
  width: "fit-content",
  maxWidth: "calc(100% - 32px)",
  padding: `${getSpace(2)}px ${getSpace(3)}px`,
  ...viewport.S({
    padding: getSpace(2),
  }),
});

const exclamationIconStyle = css({
  color: Colors.red60,
  marginRight: getSpace(1 / 2),
});

const errorTitleStyle = css({
  fontWeight: Weight.bold,
});

const errorStyle = css({
  alignItems: "center",
  display: "flex",
  marginTop: getSpace(3 / 2),
});
