import { css } from "@emotion/react";
import {
  Colors,
  getSpace,
  LineHeight,
  Typography,
  Weight,
} from "../lib/variables";
import { MaterialSymbol } from "./MaterialSymbol";
import { useState, useEffect, useRef } from "react";
import {
  applyMathJax,
  executeScriptTagsInElement,
} from "../lib/embed-init-scripts";

interface Props {
  renderedBody: string;
  tags: string[];
  title: string;
}

export const Article = ({ renderedBody, tags, title }: Props) => {
  const bodyElement = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isRendered) {
      bodyElement.current && executeScriptTagsInElement(bodyElement.current);
      bodyElement.current && applyMathJax(bodyElement.current);
    }
  }, [isRendered, bodyElement, renderedBody]);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  return (
    <article css={containerStyle}>
      <h1 css={titleStyle}>{title}</h1>
      <div css={tagListWrapStyle}>
        <MaterialSymbol fill={true} css={{ color: Colors.mediumEmphasis }}>
          sell
        </MaterialSymbol>
        <ul css={tagListStyle}>
          {tags.map((tag, index) => (
            <li key={tag}>
              <span>{tag}</span>
              {index !== tags.length - 1 && <span>,</span>}
            </li>
          ))}
        </ul>
      </div>
      <div css={bodyStyle} className="it-MdContent" ref={bodyElement}>
        <div dangerouslySetInnerHTML={{ __html: renderedBody }} />
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

const bodyStyle = css({
  marginTop: getSpace(6),
});
