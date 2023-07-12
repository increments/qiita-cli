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
  secret: boolean;
  modified: boolean;
  organizationUrlName: string | null;
  published: boolean;
  errorMessages: string[];
  qiitaItemUrl: string | null;
  slide: boolean;
}

export const ArticleInfo = ({
  secret,
  modified,
  organizationUrlName,
  published,
  errorMessages,
  qiitaItemUrl,
  slide,
}: Props) => {
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("openInfoState") === "true" ? true : false
  );

  const toggleAccordion = (event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("openInfoState", JSON.stringify(isOpen));
  }, [isOpen]);

  return (
    <>
      <details css={infoStyle} open={isOpen}>
        <summary css={infoSummaryStyle} onClick={toggleAccordion}>
          記事情報
        </summary>
        <InfoItem title="公開範囲">
          {secret ? (
            <>
              <MaterialSymbol
                css={{ color: Colors.disabled }}
                size={14}
                fill={true}
              >
                lock
              </MaterialSymbol>{" "}
              限定共有
            </>
          ) : (
            <>
              <MaterialSymbol size={14} css={{ color: Colors.disabled }}>
                public
              </MaterialSymbol>{" "}
              全体
            </>
          )}
        </InfoItem>
        <InfoItem title="記事の状態">
          {published ? (
            qiitaItemUrl ? (
              <a href={qiitaItemUrl} target="_blank" rel="noopener noreferrer">
                投稿済み
              </a>
            ) : (
              "投稿済み"
            )
          ) : (
            "未投稿"
          )}
        </InfoItem>
        <InfoItem title="差分">{modified ? "あり" : "なし"}</InfoItem>
        <InfoItem title="Organization">
          {organizationUrlName || "紐付けなし"}
        </InfoItem>
        <InfoItem title="スライドモード">{slide ? "ON" : "OFF"}</InfoItem>
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
