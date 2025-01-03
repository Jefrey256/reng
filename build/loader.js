"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCommands = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const loadCommands = () => {
    const commands = new Map();
    const commandFiles = fs_1.default.readdirSync(path_1.default.resolve(__dirname, "./commands"));
    for (const file of commandFiles) {
        if (file.endsWith(".ts") || file.endsWith(".js")) {
            const command = require(`./commands/${file}`).default;
            commands.set(command.name, command);
        }
    }
    return commands;
};
exports.loadCommands = loadCommands;
