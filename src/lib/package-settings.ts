const packageJsonData = require("../../package.json");

export const PackageSettings = {
  name: packageJsonData.name,
  userAgentName: "QiitaCLI",
  version: packageJsonData.version,
};
