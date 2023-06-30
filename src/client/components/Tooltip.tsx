import { useState, ReactNode, useCallback, useEffect } from "react";
import { css } from "@emotion/react";
import { Colors, Typography, getSpace } from "../lib/variables";

interface Props {
  children: ReactNode;
  message: string;
  horizontal?: "left" | "center" | "right";
  vertical?: "top" | "middle" | "bottom";
  offset?: number;
  tabIndex?: number;
  id?: string;
}

export const Tooltip = ({
  message,
  children,
  horizontal = "center",
  vertical = "top",
  offset = 0,
  tabIndex,
  id,
}: Props) => {
  const [isShow, setIsShow] = useState(false);

  const handleShow = () => {
    setIsShow(true);
  };

  const handleHide = () => {
    setIsShow(false);
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isShow) {
        handleHide();
      }
    },
    [isShow, handleHide]
  );

  useEffect(() => {
    if (isShow) window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isShow, handleKeyDown]);

  return (
    <div
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
      css={toolTipWrapStyle}
      aria-describedby={id}
    >
      <div
        css={toolTipItemStyle(isShow, horizontal, vertical, offset)}
        role="tooltip"
        tabIndex={tabIndex}
        id={id}
      >
        {message}
      </div>
      {children}
    </div>
  );
};

const toolTipWrapStyle = css({
  position: "relative",
});

const toolTipItemStyle = (
  isShow: boolean,
  horizontal: string,
  vertical: string,
  offset: number
) =>
  css({
    visibility: isShow ? "visible" : "hidden",
    color: Colors.gray0,
    backgroundColor: Colors.gray90,
    borderRadius: 4,
    fontSize: Typography.body3,
    position: "absolute",
    padding: `${getSpace(1 / 2)}px ${getSpace(1)}px`,
    zIndex: 10,
    maxWidth: 280,
    width: "max-content",

    ...(vertical === "top" &&
      horizontal === "center" && {
        bottom: `calc(100% + ${offset}px + 4px)`,
        left: "50%",
        transform: "translateX(-50%)",
        "&::after": {
          content: "''",
          width: 8,
          height: 4,
          position: "absolute",
          backgroundColor: Colors.gray90,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          clipPath: "polygon(0% 0%, 100% 0%, 50% 100%, 50% 100%)",
        },
      }),

    ...(vertical === "top" &&
      horizontal === "left" && {
        bottom: `calc(100% + ${offset}px + 4px)`,
        right: "calc(50% - 12px)",
        "&::after": {
          content: "''",
          width: 8,
          height: 4,
          position: "absolute",
          backgroundColor: Colors.gray90,
          top: "100%",
          right: 8,
          clipPath: "polygon(0% 0%, 100% 0%, 50% 100%, 50% 100%)",
        },
      }),

    ...(vertical === "top" &&
      horizontal === "right" && {
        bottom: `calc(100% + ${offset}px + 4px)`,
        left: "calc(50% - 12px)",
        "&::after": {
          content: "''",
          width: 8,
          height: 4,
          position: "absolute",
          backgroundColor: Colors.gray90,
          top: "100%",
          left: 8,
          clipPath: "polygon(0% 0%, 100% 0%, 50% 100%, 50% 100%)",
        },
      }),

    ...(vertical === "middle" &&
      horizontal === "left" && {
        top: "50%",
        transform: "translateY(-50%)",
        right: `calc(100% + ${offset}px + 4px)`,
        "&::after": {
          content: "''",
          width: 4,
          height: 8,
          position: "absolute",
          backgroundColor: Colors.gray90,
          top: "50%",
          transform: "translateY(-50%)",
          left: "100%",
          clipPath: "polygon(0% 0%, 100% 50%, 100% 50%, 0% 100%)",
        },
      }),

    ...(vertical === "middle" &&
      horizontal === "right" && {
        top: "50%",
        transform: "translateY(-50%)",
        left: `calc(100% + ${offset}px + 4px)`,
        "&::after": {
          content: "''",
          width: 4,
          height: 8,
          position: "absolute",
          backgroundColor: Colors.gray90,
          top: "50%",
          transform: "translateY(-50%)",
          right: "100%",
          clipPath: "polygon(0% 50%, 100% 0%, 100% 100%, 0% 50%)",
        },
      }),

    ...(vertical === "bottom" &&
      horizontal === "left" && {
        top: `calc(100% + ${offset}px + 4px)`,
        right: "calc(50% - 12px)",
        "&::after": {
          content: "''",
          width: 8,
          height: 4,
          position: "absolute",
          backgroundColor: Colors.gray90,
          bottom: "100%",
          right: 8,
          clipPath: "polygon(50% 0%, 50% 0%, 100% 100%, 0% 100%)",
        },
      }),

    ...(vertical === "bottom" &&
      horizontal === "center" && {
        top: `calc(100% + ${offset}px + 4px)`,
        left: "50%",
        transform: "translateX(-50%)",
        "&::after": {
          content: "''",
          width: 8,
          height: 4,
          position: "absolute",
          backgroundColor: Colors.gray90,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          clipPath: "polygon(50% 0%, 50% 0%, 100% 100%, 0% 100%)",
        },
      }),

    ...(vertical === "bottom" &&
      horizontal === "right" && {
        top: `calc(100% + ${offset}px + 4px)`,
        left: "calc(50% - 12px)",
        "&::after": {
          content: "''",
          width: 8,
          height: 4,
          position: "absolute",
          backgroundColor: Colors.gray90,
          bottom: "100%",
          left: 8,
          clipPath: "polygon(50% 0%, 50% 0%, 100% 100%, 0% 100%)",
        },
      }),
  });
