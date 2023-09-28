import { useEffect, useState, useCallback } from "react";

export const useWindowSize = () => {
  const isClient = typeof window === "object";

  const getWindowDimensions = useCallback(() => {
    return {
      currentWidth: isClient ? window?.innerWidth : 0,
      currentHeight: isClient ? window?.innerHeight : 0,
    };
  }, [isClient]);

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );
  useEffect(() => {
    const onResize = () => {
      setWindowDimensions(getWindowDimensions());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getWindowDimensions]);
  return windowDimensions;
};
