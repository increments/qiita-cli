import process from "node:process";
import { config } from "./config";

jest.mock("node:process");

const initMockFs = () => {
  let files: { [path: string]: string } = {};

  const getFile = (filePath: string) => {
    return files[filePath] || null;
  };

  const setFile = (filePath: string, text: string) => {
    files[filePath] = text;
  };

  const resetFiles = () => {
    files = {};
  };

  return {
    getFile,
    setFile,
    resetFiles,
  };
};

const { getFile, setFile, resetFiles } = initMockFs();
jest.mock("node:os", () => {
  return {
    homedir: jest.fn(() => {
      return "/home/test-user";
    }),
  };
});
jest.mock("node:process", () => {
  return {
    cwd: jest.fn(() => {
      return "/home/test-user/qiita-articles";
    }),
    env: {},
  };
});
jest.mock("node:fs/promises", () => {
  return {
    readFile: jest.fn((filePath: string) => {
      const text = getFile(filePath);
      if (!text) {
        const err = new Error("No such file or directory");
        (err as any).code = "ENOENT";
        throw err;
      }
      return text;
    }),
    writeFile: jest.fn((filePath: string, text: string) => {
      setFile(filePath, text);
    }),
    mkdir: jest.fn(() => { }),
  };
});
jest.mock("node:fs", () => {
  return {
    existsSync: jest.fn((filePath: string): boolean => {
      const text = getFile(filePath);
      return !!text;
    }),
  };
});

describe("config", () => {
  describe("#getCredentialDir", () => {
    beforeEach(() => {
      config.load({});
    });

    it("returns default path", () => {
      expect(config.getCredentialDir()).toEqual(
        "/home/test-user/.config/qiita-cli"
      );
    });

    describe("with options", () => {
      beforeEach(() => {
        config.load({
          credentialDir: "my-credential",
        });
      });

      it("returns customized path", () => {
        expect(config.getCredentialDir()).toEqual(
          "/home/test-user/qiita-articles/my-credential"
        );
      });
    });
  });

  describe("#getRootDir", () => {
    describe("paths", () => {
      beforeEach(() => {
        config.load({});
      });

      it("returns default path", () => {
        expect(config.getItemsRootDir()).toEqual(
          "/home/test-user/qiita-articles"
        );
      });

      describe("with options", () => {
        beforeEach(() => {
          config.load({
            itemsRootDir: "my-root",
          });
        });

        it("returns customized path", () => {
          expect(config.getItemsRootDir()).toEqual(
            "/home/test-user/qiita-articles/my-root"
          );
        });
      });
    });
  });

  describe("#getUserConfigDir", () => {
    describe("paths", () => {
      beforeEach(() => {
        config.load({});
      });

      it("returns default path", () => {
        expect(config.getUserConfigDir()).toEqual(
          "/home/test-user/qiita-articles"
        );
      });

      describe("with options", () => {
        beforeEach(() => {
          config.load({
            userConfigDir: "my-root",
          });
        });

        it("returns customized path", () => {
          expect(config.getUserConfigDir()).toEqual(
            "/home/test-user/qiita-articles/my-root"
          );
        });
      });
    });
  });

  describe("#getUserConfigFilePath", () => {
    describe("paths", () => {
      beforeEach(() => {
        config.load({});
      });

      it("returns default path", () => {
        expect(config.getUserConfigFilePath()).toEqual(
          "/home/test-user/qiita-articles/qiita.config.json"
        );
      });

      describe("with options", () => {
        beforeEach(() => {
          config.load({
            userConfigDir: "my-root",
          });
        });

        it("returns customized path", () => {
          expect(config.getUserConfigFilePath()).toEqual(
            "/home/test-user/qiita-articles/my-root/qiita.config.json"
          );
        });
      });
    });
  });

  describe("#getCacheDataDir", () => {
    beforeEach(() => {
      config.load({});
    });

    it("returns default path", () => {
      expect(config.getCacheDataDir()).toEqual(
        "/home/test-user/.cache/qiita-cli"
      );
    });

    describe("with XDG_CACHE_HOME environment", () => {
      const xdgCacheHome = "/tmp/.cache";

      const mockProcess = process as jest.Mocked<typeof process>;
      const env = mockProcess.env;
      beforeEach(() => {
        mockProcess.env = {
          ...env,
          XDG_CACHE_HOME: xdgCacheHome,
        };

        config.load({});
      });
      afterEach(() => {
        mockProcess.env = env;
      });

      it("returns customized path", () => {
        expect(config.getCacheDataDir()).toEqual(`${xdgCacheHome}/qiita-cli`);
      });
    });
  });

  describe("#getUserConfig", () => {
    const userConfigFilePath =
      "/home/test-user/qiita-articles/qiita.config.json";

    beforeEach(() => {
      config.load({});
    });

    describe("when user config file already exists", () => {
      beforeEach(() => {
        const userConfigData = {
          includePrivate: true,
          address: "localhost",
          family: "IPv4",
          port: 9999,
        };
        resetFiles();
        setFile(userConfigFilePath, JSON.stringify(userConfigData, null, 2));
      });

      it("returns user config", async () => {
        const userConfig = await config.getUserConfig();
        expect(userConfig).toStrictEqual({
          includePrivate: true,
          address: "localhost",
          family: "IPv4",
          port: 9999,
        });
      });
    });

    describe("when user config file does not exist", () => {
      beforeEach(() => {
        resetFiles();
      });

      it("returns default user config", async () => {
        const userConfig = await config.getUserConfig();
        expect(userConfig).toStrictEqual({
          includePrivate: false,
          address: "localhost",
          family: "IPv4",
          port: 8888,
        });
      });
    });
  });

  describe("#getCredential", () => {
    const credentialFilePath =
      "/home/test-user/.config/qiita-cli/credentials.json";
    const credentials = {
      default: "qiita",
      credentials: [
        {
          accessToken: "QIITA_ACCESS_TOKEN",
          name: "qiita",
        },
      ],
    };

    beforeEach(() => {
      resetFiles();
      setFile(credentialFilePath, JSON.stringify(credentials));

      config.load({});
    });

    it("returns default credential", async () => {
      const credential = await config.getCredential();
      expect(credential).toStrictEqual({
        accessToken: "QIITA_ACCESS_TOKEN",
        name: "qiita",
      });
    });
  });

  describe("#setCredential", () => {
    const credentialFilePath =
      "/home/test-user/.config/qiita-cli/credentials.json";
    const newCredential = {
      name: "test-credential",
      accessToken: "TEST_TOKEN",
    };

    beforeEach(() => {
      config.load({});
    });

    describe("when credential file already exists", () => {
      const credentialData = {
        default: "qiita",
        credentials: [
          {
            accessToken: "QIITA_ACCESS_TOKEN",
            name: "qiita",
          },
        ],
      };

      beforeEach(() => {
        resetFiles();
        setFile(credentialFilePath, JSON.stringify(credentialData));
      });

      it("appends new credential", async () => {
        await config.setCredential(newCredential);

        const newCredentialData = JSON.parse(getFile(credentialFilePath)!);
        expect(newCredentialData).toStrictEqual({
          ...credentialData,
          credentials: [...credentialData.credentials, newCredential],
        });
      });
    });

    describe("when credential file does not exists", () => {
      beforeEach(() => {
        resetFiles();
      });

      it("creates credential file", async () => {
        await config.setCredential(newCredential);

        const newCredentialData = JSON.parse(getFile(credentialFilePath)!);
        expect(newCredentialData).toStrictEqual({
          default: newCredential.name,
          credentials: [newCredential],
        });
      });
    });
  });
});
