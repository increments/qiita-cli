import classNames from "classnames";
import { MouseEvent as ReactMouseEvent, RefObject, useCallback } from "react";
import { QiitaMarkdownHtmlBody } from "../QiitaMarkdownHtmlBody";

export const SlideViewerContent = ({
  pages,
  currentPageIndex,
  onPrevious,
  onNext,
  contentRef,
}: {
  pages: string[];
  currentPageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  contentRef: RefObject<HTMLDivElement>;
}) => {
  const handleClickScreen = useCallback<
    (event: ReactMouseEvent<HTMLDivElement, MouseEvent>) => void
  >(
    (event) => {
      const clickedElement = event.target as HTMLElement;

      // If a viewer clicks <img> or <a> element, we don't navigate.
      if (clickedElement.tagName === "IMG" || clickedElement.tagName === "A") {
        return;
      }

      // We want to use getBoundingClientRect because it always returns
      // the actual rendered element dimensions, even if there are CSS
      // transformations applied to it.
      const rect = event.currentTarget.getBoundingClientRect();

      // Should we transition to the next or the previous slide?
      if (event.clientX - rect.left > rect.width / 2) {
        onNext();
      } else {
        onPrevious();
      }
    },
    [onPrevious, onNext]
  );

  return (
    <div
      className={classNames("slideMode-Viewer_content", "markdownContent", {
        "slideMode-Viewer_content--firstSlide": currentPageIndex === 0,
      })}
      onClick={handleClickScreen}
    >
      <QiitaMarkdownHtmlBody
        renderedBody={pages[currentPageIndex] || ""}
        bodyRef={contentRef}
      />
    </div>
  );
};
