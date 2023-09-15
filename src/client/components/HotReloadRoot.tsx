import {
  ReactNode,
  useEffect,
  useState,
  useContext,
  createContext,
} from "react";

interface Props {
  children?: ReactNode;
}

export const HotReloadContext = createContext({ reloadedAt: 0 });

export const HotReloadRoot = ({ children }: Props) => {
  const [reloadedAt, setReloadedAt] = useState(0);

  useEffect(() => {
    const websocket = new WebSocket(`ws:${window.location.host}`);
    websocket.onmessage = () => {
      setReloadedAt(new Date().getTime());
    };

    return () => {
      websocket.close();
    };
  }, []);

  return (
    <HotReloadContext.Provider value={{ reloadedAt }}>
      {children}
    </HotReloadContext.Provider>
  );
};

export const useHotReloadEffect = (
  callback: () => unknown,
  deps: unknown[],
) => {
  const { reloadedAt } = useContext(HotReloadContext);

  useEffect(() => {
    callback();
  }, [reloadedAt, ...deps]);
};
