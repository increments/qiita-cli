import { createRoot } from "react-dom/client";
import { App } from "./components/App";

// Add this line to enable Emotion auto label
globalThis.EMOTION_RUNTIME_AUTO_LABEL = true;

const container = document.getElementById("app");
if (!container) {
  throw new Error("`#app` is not found");
}
const root = createRoot(container);
root.render(<App />);
