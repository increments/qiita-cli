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
  bodyRef: RefObject<HTMLDivElement | null>;
}) => {
  const [isRendered, setIsRendered] = useState(false);

  // TODO: Refactor to remove useEffect for derived state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
