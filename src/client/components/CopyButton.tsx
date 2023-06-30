import { css } from "@emotion/react";
import { useCallback, useState } from "react";
import { writeClipboard } from "../lib/clipboard";
import { getSpace } from "../lib/variables";
import { MaterialSymbol } from "./MaterialSymbol";
import { Tooltip } from "./Tooltip";

interface Props {
  text: string;
}

export const CopyButton = ({ text }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyItemPath = useCallback(() => {
    setIsCopied(true);
    writeClipboard(text).then(() => {
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    });
  }, [text]);

  return (
    <Tooltip
      message={isCopied ? "コピーしました！" : "コピーする"}
      vertical="bottom"
    >
      <button css={buttonStyle} onClick={handleCopyItemPath}>
        <MaterialSymbol>content_copy</MaterialSymbol>
      </button>
    </Tooltip>
  );
};

const buttonStyle = css({
  backgroundColor: "inherit",
  padding: getSpace(1 / 2),
});
