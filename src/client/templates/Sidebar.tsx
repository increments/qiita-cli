import { css } from "@emotion/react";
import type { ReactNode } from "react";
import { Colors } from "../lib/variables";

interface Props {
  children?: ReactNode;
}

export const Sidebar = ({ children }: Props) => {
  return <div css={sidebarStyle}>{children}</div>;
};

const sidebarStyle = css({
  backgroundColor: Colors.gray0,
  gridArea: "sidebar",
  position: "sticky",
  zIndex: 1,
});
