import { css } from "@emotion/react";
import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { MarpSlideShadowContent } from "./MarpSlideShadowContent";

const LEFT_KEY = 37;
const RIGHT_KEY = 39;

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
export const MarpSlidePresenter = ({ pages, slideCss }: Props) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const totalPage = pages.length;

  const next = useCallback(() => {
    setCurrentPageIndex((index) => Math.min(index + 1, totalPage - 1));
  }, [totalPage]);
  const prev = useCallback(() => {
    setCurrentPageIndex((index) => Math.max(index - 1, 0));
  }, []);

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

  const handleClickScreen = useCallback<
    (event: ReactMouseEvent<HTMLDivElement, MouseEvent>) => void
  >(
    (event) => {
      const clickedElement = event.nativeEvent.composedPath()[0] as HTMLElement;

      if (clickedElement.tagName === "IMG" || clickedElement.tagName === "A") {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();

      if (event.clientX - rect.left > rect.width / 2) {
        next();
      } else {
        prev();
      }
    },
    [next, prev],
  );

  const page: SlidePage | undefined = pages[currentPageIndex];

  return (
    <div css={containerStyle}>
      <div css={contentStyle} onClick={handleClickScreen}>
        <MarpSlideShadowContent slideCss={slideCss} html={page?.html ?? ""} />
      </div>
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const contentStyle = css({
  cursor: "pointer",
  flex: 1,
  overflow: "auto",
});
