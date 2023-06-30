import { css } from "@emotion/react";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export const Contents = ({ children }: Props) => {
  return <div css={contentsStyle}>{children}</div>;
};

const contentsStyle = css({
  gridArea: "contents",
  height: "100vh",
  overflowX: "auto",
  width: "100%",
});
