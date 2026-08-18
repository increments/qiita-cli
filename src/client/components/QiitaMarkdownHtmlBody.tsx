import { RefObject, useEffect } from "react";
import {
  applyMathJax,
  executeScriptTagsInElement,
} from "../lib/embed-init-scripts";

export const QiitaMarkdownHtmlBody = ({
  renderedBody,
  bodyRef,
}: {
  renderedBody: string;
  bodyRef: RefObject<HTMLDivElement | null>;
}) => {
  useEffect(() => {
    if (!bodyRef.current) return;

    executeScriptTagsInElement(bodyRef.current);
    applyMathJax(bodyRef.current);
  }, [bodyRef, renderedBody]);

  return (
    <div dangerouslySetInnerHTML={{ __html: renderedBody }} ref={bodyRef}></div>
  );
};
