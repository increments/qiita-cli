import { css } from "@emotion/react";
import { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router";
import { apiSlidesShowPath } from "../../../lib/qiita-cli-url";
import type { SlidesShowViewModel } from "../../../lib/view-models/slides";
import { HeaderSlide } from "../../components/Header";
import { useHotReloadEffect } from "../../components/HotReloadRoot";
import { MarpSlidePresenter } from "../../components/MarpSlidePresenter";
import { MarpSlideViewer } from "../../components/MarpSlideViewer";
import { MaterialSymbol } from "../../components/MaterialSymbol";
import { SidebarContents } from "../../components/SidebarContents";
import { SlideInfo } from "../../components/SlideInfo";
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

export const SlidesShow = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const basename = searchParams.get("basename");
  const isPresentationMode = searchParams.get("present") === "1";

  const [slide, setSlide] = useState<SlidesShowViewModel | null>(null);
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
    const fetchURL = apiSlidesShowPath(id, queryParams);

    fetch(fetchURL).then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          setError("ファイルが見つかりません");
          setSlide(null);
        } else {
          response.json().then((data) => {
            setError(null);
            setErrorFrontmatterMessages(data.errorMessages);
            setSlide(null);
          });
        }
      } else {
        response.json().then((data) => {
          setSlide(data);
        });
      }
    });
  }, [id, basename]);

  if (isPresentationMode) {
    return slide ? (
      <div css={presentationScreenStyle}>
        <MarpSlidePresenter
          pages={slide.pages}
          slideCss={slide.css}
          title={slide.title}
        />
      </div>
    ) : (
      <div css={messageContainerStyle}>
        {error && <p css={errorMessageStyle}>{error}</p>}
      </div>
    );
  }

  const presentSearchParams = new URLSearchParams(searchParams);
  presentSearchParams.set("present", "1");
  const presentPath = `${location.pathname}?${presentSearchParams.toString()}`;

  return (
    <Main>
      <Sidebar>
        <SidebarContents
          isStateOpen={isStateOpen}
          handleMobileClose={handleMobileClose}
        />
      </Sidebar>

      <Contents>
        {slide ? (
          <>
            <HeaderSlide
              handleMobileOpen={handleMobileOpen}
              slidePath={slide.slide_path}
              presentPath={presentPath}
            />
            <div css={contentsWrapperStyle}>
              <div css={contentsContainerStyle}>
                <SlideInfo
                  title={slide.title}
                  theme={slide.theme}
                  published={slide.published}
                  pageCount={slide.pages.length}
                  errorMessages={slide.error_messages}
                />
                <div css={viewerWrapStyle}>
                  <MarpSlideViewer pages={slide.pages} slideCss={slide.css} />
                </div>
              </div>
            </div>
          </>
        ) : error ? (
          <p css={errorMessageStyle}>{error}</p>
        ) : errorFrontmatterMessages && errorFrontmatterMessages.length > 0 ? (
          <div css={errorContentsStyle}>
            <p css={errorTitleStyle}>
              スライドの設定の入力内容に誤りがあるため、プレビューが表示できません
            </p>
            {errorFrontmatterMessages.map((errorMessage, index) => (
              <p key={`error-message-${index}`} css={errorStyle}>
                <MaterialSymbol fill={true} css={exclamationIconStyle}>
                  error
                </MaterialSymbol>
                <div>{errorMessage}</div>
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

const viewerWrapStyle = css({
  marginTop: getSpace(3),
});

const presentationScreenStyle = css({
  height: "100vh",
});

const messageContainerStyle = css({
  alignItems: "center",
  display: "flex",
  height: "100vh",
  justifyContent: "center",
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
