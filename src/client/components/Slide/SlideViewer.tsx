import { useCallback, useEffect, useRef, useState } from "react";
import { SlideViewerContent } from "./SlideViewerContent";
import { SlideViewerDashboard } from "./SlideViewerDashboard";

const LEFT_KEY = 37;
const RIGHT_KEY = 39;

export const SlideViewer = ({ pages }: { pages: string[] }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollToTopOfContent = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const next = useCallback(() => {
    if (currentPageIndex + 1 < pages.length) {
      setCurrentPageIndex(currentPageIndex + 1);
      scrollToTopOfContent();
    }
  }, [currentPageIndex, pages.length, scrollToTopOfContent]);
  const prev = useCallback(() => {
    if (currentPageIndex - 1 >= 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      scrollToTopOfContent();
    }
  }, [currentPageIndex, scrollToTopOfContent]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === LEFT_KEY) {
        prev();
      } else if (event.keyCode === RIGHT_KEY) {
        next();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [next, prev]);

  return (
    <div className={"slideMode" + (isFullScreen ? " fullscreen" : "")}>
      <div className="slideMode-Viewer">
        <SlideViewerContent
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPrevious={prev}
          onNext={next}
          contentRef={contentRef}
        />
      </div>

      <SlideViewerDashboard
        currentPage={currentPageIndex + 1}
        totalPage={pages.length}
        isFullScreen={isFullScreen}
        onNext={next}
        onPrevious={prev}
        onSetPage={(page) => setCurrentPageIndex(page - 1)}
        onSwitchFullScreen={() => setIsFullScreen(!isFullScreen)}
      />
    </div>
  );
};
