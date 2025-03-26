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
  backgroundColor: Colors.gray10,
  display: "grid",
  gridTemplateAreas: `
  "sidebar contents"
  `,
  gridTemplateColumns: "auto minmax(450px, 1fr)",

  ...viewport.S({
    gridTemplateColumns: "auto minmax(0, 1fr)", // Setting min width to prevent widening
  }),
});
