import { css } from "@emotion/react";
import { useEffect } from "react";
import { Colors, Typography, getSpace } from "../lib/variables";
import { MaterialSymbol } from "./MaterialSymbol";

const messageTypes = ["success", "error"] as const;

export interface Message {
  type: (typeof messageTypes)[number];
  message: string;
}

interface Props {
  message: Message | null;
  setMessage: (message: Message | null) => void;
}

export const Snackbar = ({ message, setMessage }: Props) => {
  const REMOVE_DELAY = 5000; // 5s
  const isMessageExists = !!message;
  const isMessageTypeSuccess = isMessageExists && message.type === "success";

  useEffect(() => {
    if (!isMessageExists) {
      return;
    }

    setTimeout(() => {
      setMessage(null);
    }, REMOVE_DELAY);
  }, [message]);

  return (
    <p
      css={snackbarStyle(isMessageExists, isMessageTypeSuccess)}
      aria-live="polite"
    >
      {isMessageExists && (
        <>
          <MaterialSymbol css={iconStyle(isMessageTypeSuccess)} fill={true}>
            {isMessageTypeSuccess ? "check_circle" : "cancel"}
          </MaterialSymbol>
          {message.message}
        </>
      )}
    </p>
  );
};

const snackbarStyle = (
  isMessageExists: boolean,
  isMessageTypeSuccess: boolean,
) =>
  css({
    alignItems: "center",
    backgroundColor: isMessageTypeSuccess ? Colors.green10 : Colors.red10,
    borderRadius: 8,
    display: "flex",
    fontSize: Typography.body1,
    left: "50%",
    maxWidth: "calc(100% - 32px)",
    padding: isMessageExists ? `${getSpace(1)}px ${getSpace(3)}px` : 0,
    position: "absolute",
    textAlign: "center",
    top: 16,
    transform: "translateX(-50%)",
    width: "max-content",
  });

const iconStyle = (isMessageTypeSuccess: boolean) =>
  css({
    color: isMessageTypeSuccess ? Colors.green60 : Colors.red60,
    marginRight: getSpace(1),
  });
