"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_1 = require("../loader");
const messages_1 = require("./messages");
const handleCommands = (riko) => {
    const commands = (0, loader_1.loadCommands)();
    console.log("Comandos carregados:", commands); // Verifique se os comandos estão sendo carregados corretamente
    riko.ev.on("messages.upsert", (msg) => __awaiter(void 0, void 0, void 0, function* () {
        const { isCommand, commandName, args, from, reng } = (0, messages_1.extractMessage)(msg.messages[0]);
        if (!reng || !reng.key) {
            console.error("Mensagem inválida ou mal formatada");
            return;
        }
        if (isCommand) {
            const command = commands.get(commandName);
            if (!command) {
                yield riko.sendMessage(from, { text: `Comando não encontrado: ${commandName}` }, { quoted: reng });
                return;
            }
            try {
                yield command.handle({
                    sendReply: (message) => __awaiter(void 0, void 0, void 0, function* () {
                        yield riko.sendMessage(from, { text: message }, { quoted: reng });
                    }),
                    sendReact: (emoji) => __awaiter(void 0, void 0, void 0, function* () {
                        yield riko.sendMessage(from, { react: { text: emoji, key: reng.key } });
                    }),
                    args,
                    from,
                });
            }
            catch (error) {
                console.error("Erro ao executar o comando:", error);
                yield riko.sendMessage(from, { text: `Erro ao executar o comando: ${commandName}` }, { quoted: reng });
            }
        }
    }));
};
exports.default = handleCommands;
