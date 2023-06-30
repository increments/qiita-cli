import { css } from "@emotion/react";
import classNames from "classnames";

interface Props {
  children: string;
  className?: string;
  fill?: boolean;
  size?: 12 | 14 | 16 | 18 | 20 | 24 | 32 | 40;
  ariaLabel?: string;
  title?: string;
}

export const MaterialSymbol = ({
  children,
  className,
  fill = false,
  size = 16,
  ariaLabel,
  title,
}: Props) => {
  return (
    <span
      css={symbolStyle(fill, size)}
      className={classNames("material-symbols-outlined", className)}
      title={title}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel || undefined}
    >
      {children}
    </span>
  );
};

const symbolStyle = (fill: boolean, size: number) =>
  css({
    display: "inline-block",
    flexShrink: 0,
    fontSize: size,
    fontVariationSettings: `'FILL' ${
      fill ? 1 : 0
    }, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
    height: size,
    overflow: "hidden",
    width: size,
  });
