import { Command } from "./types/commands";
import fs from "fs";
import path from "path";

export const loadCommands = (): Map<string, Command> => {
  const commands = new Map<string, Command>();
  const commandFiles = fs.readdirSync(path.resolve(__dirname, "./commands"));

  for (const file of commandFiles) {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const command: Command = require(`./commands/${file}`).default;
      commands.set(command.name, command);
    }
  }

  return commands;
};
