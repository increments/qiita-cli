import { createRoot } from "react-dom/client";
import { App } from "./components/App";

const container = document.getElementById("app");
if (!container) {
  throw new Error("`#app` is not found");
}
const root = createRoot(container);
root.render(<App />);
