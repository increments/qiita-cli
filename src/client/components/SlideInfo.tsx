import { css } from "@emotion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Colors,
  LineHeight,
  Typography,
  Weight,
  getSpace,
} from "../lib/variables";
import { MaterialSymbol } from "./MaterialSymbol";

interface Props {
  title: string;
  theme: string | null;
  published: boolean;
  pageCount: number;
  errorMessages: string[];
}

export const SlideInfo = ({
  title,
  theme,
  published,
  pageCount,
  errorMessages,
}: Props) => {
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("openSlideInfoState") === "true" ? true : false,
  );

  const toggleAccordion = (event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("openSlideInfoState", JSON.stringify(isOpen));
  }, [isOpen]);

  return (
    <>
      <details css={infoStyle} open={isOpen}>
        <summary css={infoSummaryStyle} onClick={toggleAccordion}>
          スライド情報
        </summary>
        <InfoItem title="タイトル">{title}</InfoItem>
        <InfoItem title="テーマ">{theme ?? "未設定"}</InfoItem>
        <InfoItem title="スライドの状態">
          {published ? "投稿済み" : "未投稿"}
        </InfoItem>
        <InfoItem title="ページ数">{pageCount}</InfoItem>
      </details>
      {errorMessages.length > 0 && (
        <div css={errorContentsStyle}>
          {errorMessages.map((errorMessage, index) => (
            <p key={`error-message-${index}`} css={errorStyle}>
              <MaterialSymbol fill={true} css={exclamationIconStyle}>
                error
              </MaterialSymbol>
              {errorMessage}
            </p>
          ))}
        </div>
      )}
    </>
  );
};

const infoStyle = css({
  backgroundColor: Colors.gray10,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  padding: `${getSpace(3 / 2)}px ${getSpace(2)}px`,
  width: "100%",

  "& > summary::after": {
    fontFamily: "Material Symbols Outlined",
    content: "'expand_less'",
  },

  "&[open] > summary::after": {
    content: "'expand_more'",
  },
});

const infoSummaryStyle = css({
  alignItems: "center",
  display: "flex",
  cursor: "pointer",

  "&::-webkit-details-marker": {
    display: "none",
  },
});

interface InfoItemProps {
  children?: ReactNode;
  title: string;
}

const InfoItem = ({ children, title }: InfoItemProps) => {
  return (
    <div css={infoListStyle}>
      <p css={titleStyle}>{title}</p>
      <p css={bodyStyle}>{children}</p>
    </div>
  );
};

const infoListStyle = css({
  display: "grid",
  gridTemplateColumns: "100px minmax(0, 1fr)",
  gap: getSpace(3 / 2),

  "& + &": {
    marginTop: getSpace(1 / 2),
  },
});

const titleStyle = css({
  color: Colors.disabled,
  fontSize: Typography.body2,
  fontWeight: Weight.bold,
});

const bodyStyle = css({
  display: "flex",
  alignItems: "center",
  gap: ` 0 ${getSpace(1 / 2)}px`,
  fontSize: Typography.body2,
  lineHeight: LineHeight.bodyDense,
  wordBreak: "break-word",
});

const exclamationIconStyle = css({
  color: Colors.yellow60,
});

const errorContentsStyle = css({
  marginTop: getSpace(3),
});

const errorStyle = css({
  alignItems: "center",
  display: "flex",
  fontSize: Typography.body2,
  lineHeight: LineHeight.bodyDense,
  gap: getSpace(1 / 2),

  "& + &": {
    marginTop: getSpace(3 / 2),
  },
});
