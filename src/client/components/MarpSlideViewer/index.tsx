import { css } from "@emotion/react";
import { Colors, Typography, getSpace } from "../../lib/variables";
import { MarpSlideShadowContent } from "../MarpSlideShadowContent";

interface SlidePage {
  html: string;
  speaker_note: string[];
}

interface Props {
  pages: SlidePage[];
  slideCss: string;
}

// `slideCss`, not `css`: the Emotion JSX pragma (jsxImportSource) intercepts
// any prop literally named `css` on every element, including custom components.
export const MarpSlideViewer = ({ pages, slideCss }: Props) => {
  const totalPage = pages.length;

  return (
    <div css={listStyle}>
      {pages.map((page, index) => (
        <div key={index} css={pageWrapperStyle}>
          <div css={pageStyle}>
            <MarpSlideShadowContent slideCss={slideCss} html={page.html} />
          </div>
          <span css={pageNumberStyle}>
            {index + 1} / {totalPage}
          </span>
        </div>
      ))}
    </div>
  );
};

const listStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: getSpace(3),
  width: "100%",
});

const pageWrapperStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: getSpace(1 / 2),
  width: "100%",
});

const pageStyle = css({
  aspectRatio: "16 / 9",
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
  width: "100%",
});

const pageNumberStyle = css({
  alignSelf: "flex-end",
  color: Colors.mediumEmphasis,
  fontSize: Typography.body2,
});
