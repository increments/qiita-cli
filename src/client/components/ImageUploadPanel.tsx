import { css } from "@emotion/react";
import type { DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { pointerFine } from "../lib/mixins";
import { uploadImage } from "../lib/upload-image";
import {
  Colors,
  LineHeight,
  Typography,
  Weight,
  getSpace,
} from "../lib/variables";
import { CopyButton } from "./CopyButton";
import { MaterialSymbol } from "./MaterialSymbol";

interface UploadedImage {
  name: string;
  downloadUrl: string;
}

interface Progress {
  current: number;
  total: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
}

export const ImageUploadPanel = ({ isOpen, onRequestClose }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const isUploading = progress !== null;

  const handleFiles = async (files: File[]) => {
    if (files.length === 0 || isUploading) return;

    setErrorMessage(null);

    for (const [index, file] of files.entries()) {
      setProgress({ current: index + 1, total: files.length, name: file.name });

      try {
        const downloadUrl = await uploadImage(file);
        setUploadedImages((prev) => [
          ...prev,
          { name: file.name, downloadUrl },
        ]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : String(error));
        break;
      }
    }

    setProgress(null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(Array.from(event.dataTransfer.files));
  };

  const handleClose = () => {
    setErrorMessage(null);
    onRequestClose();
  };

  return (
    <dialog css={dialogStyle} ref={dialogRef} onClose={handleClose}>
      <div css={containerStyle}>
        <h2 css={titleStyle}>画像をアップロード</h2>

        <div
          css={dropZoneStyle(isDragOver)}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragOver(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <p css={dropZoneTextStyle}>ここに画像をドロップ</p>
          <button
            css={selectButtonStyle}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            ファイルを選択
          </button>
          <input
            accept="image/*"
            css={hiddenInputStyle}
            multiple
            onChange={(event) => {
              handleFiles(Array.from(event.currentTarget.files ?? []));
              event.currentTarget.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
        </div>

        {progress && (
          <p css={progressTextStyle}>
            アップロード中 ({progress.current}/{progress.total}):{" "}
            {progress.name}
          </p>
        )}

        {errorMessage && (
          <p css={errorStyle}>
            <MaterialSymbol fill={true} css={errorIconStyle}>
              error
            </MaterialSymbol>
            {errorMessage}
          </p>
        )}

        {uploadedImages.length > 0 && (
          <section css={sectionStyle}>
            <h3 css={sectionTitleStyle}>アップロードした画像</h3>
            <ul css={listStyle}>
              {uploadedImages.map(({ name, downloadUrl }) => (
                <li css={itemStyle} key={downloadUrl}>
                  <img alt={name} css={thumbnailStyle} src={downloadUrl} />
                  <div css={itemBodyStyle}>
                    <p css={itemNameStyle}>{name}</p>
                    <code css={itemUrlStyle}>{downloadUrl}</code>
                  </div>
                  <CopyButton text={downloadUrl} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div css={footerStyle}>
          <button
            css={buttonStyle}
            disabled={isUploading}
            onClick={handleClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </dialog>
  );
};

const dialogStyle = css({
  backgroundColor: Colors.gray0,
  border: "none",
  borderRadius: 8,
  color: "inherit",
  margin: "auto",
  maxHeight: "calc(100% - 64px)",
  maxWidth: "calc(100% - 32px)",
  padding: getSpace(3),
  width: 720,

  "&::backdrop": {
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
});

const containerStyle = css({
  display: "grid",
  gap: getSpace(2),
});

const titleStyle = css({
  fontSize: Typography.subhead2,
  fontWeight: Weight.bold,
  lineHeight: LineHeight.subhead,
});

const dropZoneStyle = (isDragOver: boolean) =>
  css({
    border: `2px dashed ${isDragOver ? Colors.green60 : Colors.divider}`,
    borderRadius: 8,
    display: "grid",
    gap: getSpace(2),
    justifyItems: "center",
    minHeight: 160,
    padding: getSpace(2),
    placeContent: "center",
  });

const dropZoneTextStyle = css({
  color: Colors.mediumEmphasis,
  fontSize: Typography.body1,
  lineHeight: LineHeight.body,
});

const buttonStyle = css({
  alignItems: "center",
  backgroundColor: Colors.gray0,
  border: `2px solid ${Colors.divider}`,
  borderRadius: 8,
  display: "flex",
  fontWeight: Weight.bold,
  padding: `${getSpace(1 / 2)}px ${getSpace(2)}px`,

  "&:disabled": {
    opacity: 0.32,
  },

  "&:active": {
    backgroundColor: Colors.gray20,
  },

  ...pointerFine({
    "&:hover": {
      backgroundColor: Colors.gray20,
    },
  }),
});

const selectButtonStyle = css(buttonStyle, {
  border: `2px solid ${Colors.green60}`,
  color: Colors.green80,
});

const hiddenInputStyle = css({
  display: "none",
});

const progressTextStyle = css({
  color: Colors.mediumEmphasis,
  fontSize: Typography.body2,
  lineHeight: LineHeight.body,
});

const errorStyle = css({
  alignItems: "center",
  backgroundColor: Colors.red10,
  borderRadius: 8,
  display: "flex",
  fontSize: Typography.body2,
  gap: getSpace(1 / 2),
  lineHeight: LineHeight.bodyDense,
  padding: `${getSpace(1)}px ${getSpace(3 / 2)}px`,
});

const errorIconStyle = css({
  color: Colors.red60,
});

const sectionStyle = css({
  display: "grid",
  gap: getSpace(1),
});

const sectionTitleStyle = css({
  fontSize: Typography.body1,
  fontWeight: Weight.bold,
  lineHeight: LineHeight.body,
});

const listStyle = css({
  border: `1px solid ${Colors.divider}`,
  borderRadius: 8,
  display: "grid",
  maxHeight: 240,
  overflowY: "auto",
});

const itemStyle = css({
  alignItems: "center",
  display: "grid",
  gap: getSpace(3 / 2),
  gridTemplateColumns: "48px minmax(0, 1fr) auto",
  padding: getSpace(1),

  "& + &": {
    borderTop: `1px solid ${Colors.divider}`,
  },
});

const thumbnailStyle = css({
  height: 48,
  objectFit: "contain",
  width: 48,
});

const itemBodyStyle = css({
  display: "grid",
  gap: getSpace(1 / 4),
});

const itemNameStyle = css({
  fontSize: Typography.body2,
  lineHeight: LineHeight.bodyDense,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const itemUrlStyle = css({
  color: Colors.mediumEmphasis,
  fontSize: Typography.body3,
  lineHeight: LineHeight.bodyDense,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const footerStyle = css({
  borderTop: `1px solid ${Colors.divider}`,
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: getSpace(2),
});
