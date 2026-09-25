import { css } from "@emotion/react";
import {
  Colors,
  LineHeight,
  Typography,
  Weight,
  getSpace,
} from "../../lib/variables";
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
  return (
    <div css={listStyle}>
      {pages.map((page, index) => (
        <div key={index} css={pageWrapperStyle}>
          <div css={pageStyle}>
            <MarpSlideShadowContent slideCss={slideCss} html={page.html} />
          </div>
          {page.speaker_note.length > 0 && (
            <section css={speakerNoteStyle}>
              <h2 css={speakerNoteLabelStyle}>スピーカーノート</h2>
              {page.speaker_note.map((note, noteIndex) => (
                <p key={noteIndex} css={speakerNoteBodyStyle}>
                  {note}
                </p>
              ))}
            </section>
          )}
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
  gap: getSpace(2),
  width: "100%",
});

const pageStyle = css({
  aspectRatio: "16 / 9",
  border: `1px solid ${Colors.divider}`,
  boxSizing: "border-box",
  overflow: "hidden",
  width: "100%",
});

const speakerNoteStyle = css({
  backgroundColor: Colors.surfaceVariant,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  gap: getSpace(1),
  padding: `${getSpace(3 / 2)}px ${getSpace(2)}px`,
});

const speakerNoteLabelStyle = css({
  fontSize: Typography.body1,
  fontWeight: Weight.bold,
  lineHeight: LineHeight.body,
});

const speakerNoteBodyStyle = css({
  fontSize: Typography.body1,
  lineHeight: LineHeight.body,
  whiteSpace: "pre-wrap",
});
