import { RefObject, useEffect, useState } from "react";
import {
  applyMathJax,
  executeScriptTagsInElement,
} from "../lib/embed-init-scripts";

export const QiitaMarkdownHtmlBody = ({
  renderedBody,
  bodyRef,
}: {
  renderedBody: string;
  bodyRef: RefObject<HTMLDivElement>;
}) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  useEffect(() => {
    if (isRendered && bodyRef.current) {
      executeScriptTagsInElement(bodyRef.current);
      applyMathJax(bodyRef.current);
    }
  }, [isRendered, bodyRef, renderedBody]);

  return (
    <div dangerouslySetInnerHTML={{ __html: renderedBody }} ref={bodyRef}></div>
  );
};
