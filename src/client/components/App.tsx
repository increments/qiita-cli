import { StrictMode } from "react";
import { HotReloadRoot } from "./HotReloadRoot";
import { Router } from "./Router";

export const App = () => {
  return (
    <StrictMode>
      <HotReloadRoot>
        <Router />
      </HotReloadRoot>
    </StrictMode>
  );
};
