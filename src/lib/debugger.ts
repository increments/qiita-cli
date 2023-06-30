import debug from "debug";

const rootNameSpace = "qiita-cli";
const qiitaApiNameSpace = "qiita-api";

export const enableDebug = () => {
  debug.enable(`${rootNameSpace}:*,${qiitaApiNameSpace}`);
};

export const configDebugger = debug(`${rootNameSpace}:config`);
export const serverDebugger = debug(`${rootNameSpace}:server`);
