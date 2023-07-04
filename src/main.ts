#!/usr/bin/env node

import arg from "arg";
import dotenv from "dotenv";
import { exec } from "./commands";
import { config } from "./lib/config";
import { enableDebug } from "./lib/debugger";

// TODO: Load `.env` file only in development environment.
dotenv.config();

const args = arg(
  {
    "--credential": String,
    "--profile": String,
    "--root": String,
    "--verbose": Boolean,
  },
  {
    permissive: true,
  }
);

const commandName = args._[0] || "preview";
const commandArgs = args._.slice(1);

if (args["--verbose"]) {
  enableDebug();
}

config.load({
  credentialDir: args["--credential"],
  profile: args["--profile"],
  itemsRootDir: args["--root"],
});

exec(commandName, commandArgs);
