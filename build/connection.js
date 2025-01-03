"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reng = reng;
const baileys_1 = __importStar(require("baileys"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const pino_1 = __importDefault(require("pino"));
const messages_1 = require("./exports/messages");
function reng() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(__dirname, "../database/qr-code"));
        const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const question = (text) => {
            return new Promise((resolve) => {
                rl.question(text, resolve);
            });
        };
        const logger = (0, pino_1.default)({ level: "silent" });
        const store = (0, baileys_1.makeInMemoryStore)({});
        store.readFromFile(path_1.default.resolve(__dirname, "../database/data-store/store.json"));
        setInterval(() => {
            store.writeToFile(path_1.default.resolve(__dirname, "../database/data-store/store.json"));
        }, 10000);
        const riko = (0, baileys_1.default)({
            printQRInTerminal: false,
            version,
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            logger,
            markOnlineOnConnect: true,
            syncFullHistory: true
        });
        console.log(`Usando o Baileys v${version}${isLatest ? "" : " (Desatualizado)"}`);
        riko.ev.on("connection.update", (update) => {
            var _a;
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shoudReconnect = ((_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                console.log("Conexão fechada!");
                if (shoudReconnect) {
                    reng();
                }
            }
            else if (connection === "open") {
                console.log("Conexão aberta com sucesso!");
            }
        });
        if (!((_a = state.creds) === null || _a === void 0 ? void 0 : _a.registered)) {
            let phoneNumber = yield question("Digite seu número de telefone: ");
            phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
            if (!phoneNumber) {
                throw new Error("Número de Telefone inválido");
            }
            const code = yield riko.requestPairingCode(phoneNumber);
            console.log(`Codigo de Pareamento: ${code}`);
        }
        riko.ev.on("creds.update", saveCreds);
        riko.ev.on("chats.upsert", () => {
            console.log("Tem conversas", store.chats.all());
        });
        riko.ev.on("chats.update", (updates) => __awaiter(this, void 0, void 0, function* () {
            for (const chat of updates) {
                console.log(`Chat atualizado: ${chat.id}, messagens não lidas: ${chat.unreadCount}`);
            }
        }));
        riko.ev.on("messages.upsert", (reng) => __awaiter(this, void 0, void 0, function* () {
            const message = reng.messages && reng.messages[0];
            if (!message || !message.message)
                return;
            const { userName, textMessage, from } = (0, messages_1.extractMessage)(riko);
            if (textMessage) {
                const tolowerCase = textMessage.tolowerCase();
                if (tolowerCase.includes("oi") || tolowerCase.includes("ola")) {
                    console.log("repondendo");
                    yield riko.sendMessage(from, {
                        text: "Ola tudo Bem"
                    });
                }
            }
        }));
    });
}
