import { css } from "@emotion/react";
import { useRef } from "react";
import {
  Colors,
  LineHeight,
  Typography,
  Weight,
  getSpace,
} from "../lib/variables";
import { QiitaMarkdownHtmlBody } from "./QiitaMarkdownHtmlBody";
import { Slide } from "./Slide";

interface Props {
  renderedBody: string;
  tags: string[];
  title: string;
  slide: boolean;
}

export const Article = ({ renderedBody, tags, title, slide }: Props) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <article css={containerStyle}>
      <h1 css={titleStyle}>{title}</h1>
      <div css={tagListWrapStyle}>
        <ul css={tagListStyle}>
          {tags.map((tag, index) => (
            <li css={tagListItemStyle} key={tag}>
              <span>{tag}</span>
              {index !== tags.length - 1 && <span>,</span>}
            </li>
          ))}
        </ul>
      </div>
      <div css={bodyStyle} className="it-MdContent">
        {slide && <Slide renderedBody={renderedBody} title={title} />}
        <QiitaMarkdownHtmlBody renderedBody={renderedBody} bodyRef={bodyRef} />
      </div>
    </article>
  );
};

const containerStyle = css({
  wordBreak: "break-word",
});

const titleStyle = css({
  fontSize: Typography.headline1,
  fontWeight: Weight.bold,
  lineHeight: LineHeight.headline,
});

const tagListWrapStyle = css({
  marginTop: getSpace(1),
  alignItems: "center",
  display: "flex",
  gap: getSpace(1),
});

const tagListStyle = css({
  display: "flex",
  gap: getSpace(1),
});

const tagListItemStyle = css({
  backgroundColor: Colors.surfaceVariant,
  borderRadius: 4,
  color: Colors.mediumEmphasis,
  fontSize: Typography.body2,
  padding: `0 ${getSpace(3 / 4)}px`,
});

const bodyStyle = css({
  marginTop: getSpace(6),
});
