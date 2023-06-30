import { css } from "@emotion/react";
import { useState } from "react";
import { apiReadmeShowPath } from "../../../lib/qiita-cli-url";
import { HeaderIndex } from "../../components/Header";
import { useHotReloadEffect } from "../../components/HotReloadRoot";
import { SidebarContents } from "../../components/SidebarContents";
import { breakpoint, viewport } from "../../lib/mixins";
import { Colors, Typography, getSpace } from "../../lib/variables";
import { useWindowSize } from "../../lib/window-size";
import { Contents } from "../../templates/Contents";
import { Main } from "../../templates/Main";
import { Sidebar } from "../../templates/Sidebar";

export const ItemsIndex = () => {
  const [isStateOpen, setIsStateOpen] = useState(false);

  const handleMobileOpen = () => {
    setIsStateOpen(true);
  };

  const handleMobileClose = () => {
    setIsStateOpen(false);
  };
  const { currentWidth } = useWindowSize();
  const mobileSize = currentWidth <= breakpoint.S;

  const [readme, setReadme] = useState<{
    renderedBody: string;
  } | null>(null);
  const [error, setError] = useState<null | string>(null);

  useHotReloadEffect(() => {
    const fetchURL = apiReadmeShowPath();
    fetch(fetchURL).then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          setError("ファイルが見つかりません");
        } else {
          setError("不明なエラーが発生しました");
        }
      } else {
        response.json().then((data) => {
          setReadme(data);
        });
      }
    });
  }, []);

  return (
    <Main>
      <Sidebar>
        <SidebarContents
          isStateOpen={isStateOpen}
          handleMobileClose={handleMobileClose}
        />
      </Sidebar>

      <Contents>
        {mobileSize && <HeaderIndex handleMobileOpen={handleMobileOpen} />}
        {readme ? (
          <div css={contentsWrapperStyle}>
            <div css={contentsContainerStyle}>
              <div className="it-MdContent">
                <div
                  dangerouslySetInnerHTML={{ __html: readme.renderedBody }}
                />
              </div>
            </div>
          </div>
        ) : error ? (
          <p css={errorMessageStyle}>{error}</p>
        ) : null}
      </Contents>
    </Main>
  );
};

const contentsWrapperStyle = css({
  margin: `${getSpace(2)}px ${getSpace(2)}px 0`,
  ...viewport.S({
    margin: 0,
  }),
});

const contentsContainerStyle = css({
  backgroundColor: Colors.gray0,
  borderRadius: 8,
  maxWidth: 820,
  margin: "0 auto",
  padding: getSpace(3),
});

const errorMessageStyle = css({
  fontSize: Typography.subhead2,
  padding: getSpace(2),
  textAlign: "center",
});
