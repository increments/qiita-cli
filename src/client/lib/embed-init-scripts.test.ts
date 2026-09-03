interface GlobalWithWindow {
  window: { qiitaEmbedInit?: unknown } | undefined;
}

const globalWithWindow = global as unknown as GlobalWithWindow;

describe("embed-init-scripts", () => {
  const originalWindow = globalWithWindow.window;

  afterEach(() => {
    globalWithWindow.window = originalWindow;
  });

  const loadModule = (): typeof import("./embed-init-scripts") => {
    let mod!: typeof import("./embed-init-scripts");
    jest.isolateModules(() => {
      mod = require("./embed-init-scripts");
    });
    return mod;
  };

  describe("when window.qiitaEmbedInit is undefined", () => {
    beforeEach(() => {
      globalWithWindow.window = {};
    });

    it("does not throw while loading the module", () => {
      expect(() => loadModule()).not.toThrow();
    });

    it("exposes undefined utilities", () => {
      const { applyMathJax, executeScriptTagsInElement } = loadModule();

      expect(applyMathJax).toBeUndefined();
      expect(executeScriptTagsInElement).toBeUndefined();
    });
  });

  describe("when window.qiitaEmbedInit is defined", () => {
    const applyMathJax = jest.fn();
    const executeScriptTagsInElement = jest.fn();

    beforeEach(() => {
      globalWithWindow.window = {
        qiitaEmbedInit: { applyMathJax, executeScriptTagsInElement },
      };
    });

    it("exposes the underlying utilities", () => {
      const mod = loadModule();

      expect(mod.applyMathJax).toBe(applyMathJax);
      expect(mod.executeScriptTagsInElement).toBe(executeScriptTagsInElement);
    });
  });
});
