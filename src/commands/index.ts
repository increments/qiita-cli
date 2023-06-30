import { help, helpText } from "./help";
import { init } from "./init";
import { login } from "./login";
import { newArticles } from "./newArticles";
import { preview } from "./preview";
import { publish } from "./publish";
import { version } from "./version";
import { pull } from "./pull";

export const exec = (commandName: string, commandArgs: string[]) => {
  const commands = {
    init,
    login,
    new: newArticles,
    preview,
    publish,
    pull,
    help,
    version,
    "--help": help,
    "--version": version,
  };

  const isCommand = (key: string): key is keyof typeof commands => {
    return commands.hasOwnProperty(key);
  };

  if (!isCommand(commandName)) {
    console.error(`Unknown command '${commandName}'`);
    console.error();
    console.error(helpText);
    process.exit(1);
  }

  commands[commandName](commandArgs);
};
