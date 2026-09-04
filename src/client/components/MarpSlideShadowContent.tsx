import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  html: string;
  slideCss: string;
}

// Marp-generated CSS targets bare element/`:root` selectors, so it must be
// rendered inside a shadow root to avoid leaking into (or being overridden
// by) the surrounding app styles.
// Named `slideCss`, not `css`: the Emotion JSX pragma (jsxImportSource) intercepts
// any prop literally named `css` on every element, including custom components.
export const MarpSlideShadowContent = ({ html, slideCss }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    setShadowRoot(
      hostRef.current.shadowRoot ??
        hostRef.current.attachShadow({ mode: "open" }),
    );
  }, []);

  return (
    <div ref={hostRef} css={hostStyle}>
      {shadowRoot &&
        createPortal(
          <>
            <style>{slideCss}</style>
            <div
              className="marp-slide-container"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </>,
          shadowRoot,
        )}
    </div>
  );
};

const hostStyle = css({
  height: "100%",
  width: "100%",
});
