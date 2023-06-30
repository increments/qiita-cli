import { css } from "@emotion/react";
import type { ReactNode } from "react";
import { Colors } from "../lib/variables";
import { viewport } from "../lib/mixins";

interface Props {
  children?: ReactNode;
}

export const Main = ({ children }: Props) => {
  return <main css={mainStyle}>{children}</main>;
};

const mainStyle = css({
  backgroundColor: Colors.gray5,
  display: "grid",
  gridTemplateAreas: `
  "sidebar contents"
  `,
  gridTemplateColumns: "auto minmax(450px, 1fr)",
  height: "100vh",

  ...viewport.S({
    gridTemplateColumns: "auto 1fr",
  }),
});
