import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { configDebugger } from "./debugger";

interface Options {
  credentialDir?: string;
  profile?: string;
  itemsRootDir?: string;
  userConfigDir?: string;
}

type UserConfig = {
  includePrivate: boolean;
  address: string;
  family: string;
  port: number;
};

class Config {
  private credentialDir?: string;
  private itemsRootDir?: string;
  private userConfigFilePath?: string;
  private userConfigDir?: string;
  private credential?: Credential;
  private cacheDataDir?: string;
  private readonly packageName: string;

  constructor() {
    this.packageName = "qiita-cli";
  }

  load(options: Options) {
    this.credentialDir = this.resolveConfigDir(options.credentialDir);
    this.itemsRootDir = this.resolveItemsRootDir(options.itemsRootDir);
    this.userConfigDir = this.resolveUserConfigDirPath(options.userConfigDir);
    this.userConfigFilePath = this.resolveUserConfigFilePath(
      options.userConfigDir
    );
    this.cacheDataDir = this.resolveCacheDataDir();
    this.credential = new Credential({
      credentialDir: this.credentialDir,
      profile: options.profile,
    });

    configDebugger(
      "load",
      JSON.stringify({
        credentialDir: this.credentialDir,
        itemsRootDir: this.itemsRootDir,
        userConfigFilePath: this.userConfigFilePath,
        cacheDataDir: this.cacheDataDir,
      })
    );
  }

  getCredentialDir() {
    if (!this.credentialDir) {
      throw new Error("credentialDir is undefined");
    }
    return this.credentialDir;
  }

  // TODO: filesystemrepo 側にあるべきか確認
  getItemsRootDir() {
    if (!this.itemsRootDir) {
      throw new Error("itemsRootDir is undefined");
    }
    return this.itemsRootDir;
  }

  getUserConfigDir() {
    if (!this.userConfigDir) {
      throw new Error("userConfigDir is undefined");
    }
    return this.userConfigDir;
  }

  getUserConfigFilePath() {
    if (!this.userConfigFilePath) {
      throw new Error("userConfigFilePath is undefined");
    }
    return this.userConfigFilePath;
  }

  getCacheDataDir() {
    if (!this.cacheDataDir) {
      throw new Error("cacheDataDir is undefined");
    }
    return this.cacheDataDir;
  }

  getCredential() {
    if (!this.credential) {
      throw new Error("credential is undefined");
    }
    return this.credential.getCredential();
  }

  setCredential(credential: CredentialItem) {
    if (!this.credential) {
      throw new Error("credential is undefined");
    }
    return this.credential.setCredential(credential);
  }

  async getUserConfig() {
    const defaultConfig = {
      includePrivate: false,
      address: "localhost",
      family: "IPv4",
      port: 8888,
    } as UserConfig;

    if (fsSync.existsSync(this.getUserConfigFilePath())) {
      const userConfigFileData = await fs.readFile(
        this.userConfigFilePath as string
      );
      const userConfig = JSON.parse(
        userConfigFileData.toString()
      ) as UserConfig;
      return { ...defaultConfig, ...userConfig };
    }

    return defaultConfig;
  }

  private resolveConfigDir(credentialDirPath?: string) {
    if (process.env.XDG_CONFIG_HOME) {
      const credentialDir = process.env.XDG_CONFIG_HOME;
      return path.join(credentialDir, this.packageName);
    }
    if (!credentialDirPath) {
      const homeDir = os.homedir();
      return path.join(homeDir, ".config", this.packageName);
    }

    return this.resolveFullPath(credentialDirPath);
  }

  private resolveItemsRootDir(dirPath?: string) {
    if (process.env.QIITA_CLI_ITEMS_ROOT) {
      return process.env.QIITA_CLI_ITEMS_ROOT;
    }
    if (!dirPath) {
      return process.cwd();
    }

    return this.resolveFullPath(dirPath);
  }

  private resolveUserConfigDirPath(dirPath?: string) {
    if (process.env.QIITA_CLI_USER_CONFIG_DIR) {
      return process.env.QIITA_CLI_USER_CONFIG_DIR;
    }
    if (!dirPath) {
      return process.cwd();
    }

    return this.resolveFullPath(dirPath);
  }

  private resolveUserConfigFilePath(dirPath?: string) {
    const filename = "qiita.config.json";
    return path.join(this.resolveUserConfigDirPath(dirPath), filename);
  }

  private resolveCacheDataDir() {
    const cacheHome =
      process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
    return path.join(cacheHome, this.packageName);
  }

  private resolveFullPath(filePath: string) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    } else {
      return path.join(process.cwd(), filePath);
    }
  }
}

interface CredentialData {
  default: string;
  credentials: CredentialItem[];
}
interface CredentialItem {
  accessToken: string;
  name: string;
}

/**
 * credential file format example:
 *
 * {
 *   "default": "qiita",
 *   "credentials": [
 *     {
 *       "accessToken": "PUBLIC_ACCESS_TOKEN",
 *       "name": "qiita"
 *     },
 *   ]
 * }
 */
class Credential {
  private cache: CredentialData | null;
  private readonly credentialFilePath: string;
  private readonly credentialDir: string;
  private readonly currentProfile?: string;

  constructor({
    credentialDir,
    profile,
  }: {
    credentialDir: string;
    profile?: string;
  }) {
    this.credentialFilePath = path.join(credentialDir, "credentials.json");
    this.credentialDir = credentialDir;
    this.currentProfile = profile;
    this.cache = null;
  }

  private async load() {
    if (this.cache !== null) {
      return this.cache;
    }

    let credentialData: CredentialData;

    if (process.env.QIITA_TOKEN) {
      const name = "environment variable";

      credentialData = {
        default: name,
        credentials: [
          {
            accessToken: process.env.QIITA_TOKEN,
            name,
          },
        ],
      };
    } else {
      const data = await fs.readFile(this.credentialFilePath, {
        encoding: "utf8",
      });
      credentialData = JSON.parse(data);
    }

    this.cache = credentialData;
    return credentialData;
  }

  private refresh() {
    this.cache = null;
  }

  async getCredential() {
    const credentialData = await this.load();

    const profile = this.currentProfile
      ? this.currentProfile
      : credentialData.default;
    const credential = credentialData.credentials.find(
      (cred) => cred.name === profile
    );

    if (!credential) {
      console.error("CredentialError:");
      console.error(`  profile is not exists '${profile}'`);
      process.exit(1);
    }

    configDebugger(
      "use credential",
      JSON.stringify({ ...credential, accessToken: "******" })
    );

    return credential;
  }

  async setCredential(credential: CredentialItem) {
    let credentialData: CredentialData;

    try {
      credentialData = await this.load();
    } catch (err: any) {
      // Error is not `no such file or directory`
      if (err.code !== "ENOENT") {
        throw err;
      }

      await fs.mkdir(this.credentialDir, { recursive: true });

      credentialData = {
        default: credential.name,
        credentials: [],
      };
    }

    const newCredentialData: CredentialData = {
      default: credentialData.default,
      credentials: [
        ...credentialData.credentials.filter(
          (cred) => cred.name !== credential.name
        ),
        credential,
      ],
    };

    await fs.writeFile(
      this.credentialFilePath,
      JSON.stringify(newCredentialData, null, 2),
      { encoding: "utf8", mode: 0o600 }
    );

    this.refresh();
  }
}

const config = new Config();
export { config };
