import { css } from "@emotion/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { apiItemsUpdatePath, itemsShowPath } from "../../lib/qiita-cli-url";
import { breakpoint, pointerFine } from "../lib/mixins";
import { Colors, Typography, Weight, getSpace } from "../lib/variables";
import { useWindowSize } from "../lib/window-size";
import { CopyButton } from "./CopyButton";
import { QiitaPreviewLogo } from "./Logo";
import { MaterialSymbol } from "./MaterialSymbol";
import { Snackbar, Message as SnackbarMessage } from "./Snackbar";

interface Props {
  id?: string;
  isItemPublishable: boolean;
  isOlderThanRemote: boolean;
  itemPath: string;
  basename: string | null;
  handleMobileOpen: () => void;
}

export const Header = ({
  id,
  isItemPublishable,
  isOlderThanRemote,
  itemPath,
  basename,
  handleMobileOpen,
}: Props) => {
  const navigate = useNavigate();
  const [snackbarMessage, setSnackbarMessage] =
    useState<null | SnackbarMessage>(null);
  const { currentWidth } = useWindowSize();
  const mobileSize = currentWidth <= breakpoint.S;

  const handlePublish = () => {
    if (isOlderThanRemote) {
      if (
        !window.confirm(
          "この記事はQiita上の記事より古い可能性があります。上書きしますか？",
        )
      ) {
        return;
      }
    }

    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ basename: basename }),
    };

    if (id !== undefined) {
      fetch(apiItemsUpdatePath(id), params)
        .then((response) => response.json())
        .then((data) => {
          if (!data.uuid) {
            setSnackbarMessage({
              type: "error",
              message: "投稿に失敗しました",
            });

            return;
          }

          try {
            setSnackbarMessage({
              type: "success",
              message: "記事が投稿されました",
            });

            navigate(itemsShowPath(data.uuid));
          } catch {
            navigate(0);
          }
        });
    }
  };

  return (
    <header css={headerStyle}>
      {mobileSize ? (
        <div css={headerItemStyle}>
          <button
            aria-label="メニューを開く"
            css={headerMenuButtonStyle}
            onClick={handleMobileOpen}
          >
            <MaterialSymbol size={24}>menu</MaterialSymbol>
          </button>
          <div css={mobileHeaderCopyButtonStyle}>
            ファイルパスをコピー
            <CopyButton text={itemPath} />
          </div>
        </div>
      ) : (
        <div css={headerItemStyle}>
          <p>{itemPath}</p>
          <CopyButton text={itemPath} />
        </div>
      )}
      <button
        css={headerButtonStyle}
        disabled={!isItemPublishable}
        onClick={handlePublish}
      >
        {mobileSize ? "投稿する" : "記事を投稿する"}
        <MaterialSymbol>publish</MaterialSymbol>
      </button>
      <Snackbar message={snackbarMessage} setMessage={setSnackbarMessage} />
    </header>
  );
};

export const HeaderIndex = ({
  handleMobileOpen,
}: Pick<Props, "handleMobileOpen">) => {
  return (
    <header css={headerStyle}>
      <div css={headerItemStyle}>
        <button
          aria-label="メニューを開く"
          css={headerMenuButtonStyle}
          onClick={handleMobileOpen}
        >
          <MaterialSymbol size={24}>menu</MaterialSymbol>
        </button>
        <h1 css={headerLogoWrapperStyle}>
          <QiitaPreviewLogo css={headerLogoStyle} />
        </h1>
      </div>
    </header>
  );
};

const headerStyle = css({
  alignItems: "center",
  backgroundColor: Colors.gray0,
  borderBottom: `1px solid ${Colors.divider}`,
  display: "flex",
  justifyContent: "space-between",
  padding: `${getSpace(1)}px ${getSpace(2)}px`,
  position: "relative",
});

const headerItemStyle = css({
  alignItems: "center",
  display: "flex",
  fontSize: Typography.body2,
  color: Colors.mediumEmphasis,
  gap: `0 ${getSpace(1 / 2)}px`,
});

const headerMenuButtonStyle = css({
  backgroundColor: "inherit",
  padding: getSpace(1),
});

const mobileHeaderCopyButtonStyle = css({
  alignItems: "center",
  display: "grid",
  gap: getSpace(1 / 2),
  gridTemplateColumns: "1fr 16px",
  padding: 0,
});

const headerButtonStyle = css({
  alignItems: "center",
  backgroundColor: Colors.gray0,
  border: `2px solid ${Colors.green60}`,
  borderRadius: 8,
  color: Colors.green80,
  display: "flex",
  fontWeight: Weight.bold,
  gap: `0 ${getSpace(1 / 2)}px`,
  padding: `${getSpace(1 / 2)}px ${getSpace(2)}px`,

  "&:disabled": {
    opacity: 0.32,
  },

  "&:active": {
    backgroundColor: Colors.gray20,
  },

  ...pointerFine({
    "&:hover": {
      backgroundColor: Colors.gray20,
    },
  }),
});

const headerLogoWrapperStyle = css({
  display: "flex",
});

const headerLogoStyle = css({
  height: 24,
});
