import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { configDebugger } from "./debugger";

interface Options {
  configDir?: string;
  profile?: string;
  itemsRootDir?: string;
}

class Config {
  private configDir?: string;
  private itemsRootDir?: string;
  private credential?: Credential;

  constructor() {}

  load(options: Options) {
    this.configDir = this.resolveConfigDir(options.configDir);
    this.itemsRootDir = this.resolveItemsRootDir(options.itemsRootDir);
    this.credential = new Credential({
      credentialDir: this.configDir,
      profile: options.profile,
    });

    configDebugger(
      "load",
      JSON.stringify({
        configDir: this.configDir,
        itemsRootDir: this.itemsRootDir,
      })
    );
  }

  getConfigDir() {
    if (!this.configDir) {
      throw new Error("configDir is undefined");
    }
    return this.configDir;
  }

  // TODO: filesystemrepo 側にあるべきか確認
  getItemsRootDir() {
    if (!this.itemsRootDir) {
      throw new Error("itemsRootDir is undefined");
    }
    return this.itemsRootDir;
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

  private resolveConfigDir(configDirPath?: string) {
    const packageName = "qiita-cli";

    if (process.env.XDG_CONFIG_HOME) {
      const configDir = process.env.XDG_CONFIG_HOME;
      return path.join(configDir, packageName);
    }
    if (!configDirPath) {
      const homeDir = os.homedir();
      return path.join(homeDir, ".config", packageName);
    }

    return this.resolveFullPath(configDirPath);
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
