import { config } from "./config";

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
    mkdir: jest.fn(() => {}),
  };
});

describe("config", () => {
  describe("#getConfigDir", () => {
    beforeEach(() => {
      config.load({});
    });

    it("returns default path", () => {
      expect(config.getConfigDir()).toEqual(
        "/home/test-user/.config/qiita-cli"
      );
    });

    describe("with options", () => {
      beforeEach(() => {
        config.load({
          configDir: "my-config",
        });
      });

      it("returns customized path", () => {
        expect(config.getConfigDir()).toEqual(
          "/home/test-user/qiita-articles/my-config"
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
