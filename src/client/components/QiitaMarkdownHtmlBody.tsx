import { RefObject, useEffect, useRef } from "react";
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
  // Not idempotent, so run once per body: StrictMode double-invokes effects.
  const initializedBodyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    if (initializedBodyRef.current === renderedBody) return;

    initializedBodyRef.current = renderedBody;
    executeScriptTagsInElement(bodyRef.current);
    applyMathJax(bodyRef.current);
  }, [bodyRef, renderedBody]);

  return (
    <div dangerouslySetInnerHTML={{ __html: renderedBody }} ref={bodyRef}></div>
  );
};
