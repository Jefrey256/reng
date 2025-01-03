import makeWASocket,{useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, makeInMemoryStore} from "baileys";
import path, { resolve } from "path";
import readline from "readline"
import pino from "pino";




export async function reng ():Promise<void> {
    const {state, saveCreds} = await useMultiFileAuthState(path.resolve(__dirname, "../database/qr-code"))
    const {version, isLatest} = await fetchLatestBaileysVersion()
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    const question = (text:string): Promise<string> =>{
        return new Promise((resolve)=>{
            rl.question(text,resolve)
        })
    }
    const logger = pino().child({ level: "silent" , stream: "store"})

    const store = makeInMemoryStore({})
    store.readFromFile(path.resolve(__dirname, "../database/data-store/store.json"))
    setInterval(() => {
        store.writeToFile(path.resolve(__dirname, "../database/data-store/store.json"))
    }, 10_000)


    const riko = makeWASocket({
        printQRInTerminal: false,
        version,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        logger,
        markOnlineOnConnect: true,
        syncFullHistory: true

    })
    console.log(`Usando o Baileys v${version}${isLatest ? "" : " (Desatualizado)"}`)

    riko.ev.on("connection.update", (update)=>{
        const {connection, lastDisconnect} = update
        if (connection === "close") {
            const shoudReconnect = (lastDisconnect?.error as any)?.statusCode !== DisconnectReason.loggedOut
            console.log("Conexão fechada!")
            if (shoudReconnect){
                reng()
            }
        } else if (connection === "open") {
            console.log("Conexão aberta com sucesso!")
        }
    })

    if (!state.creds?.registered){
        let phoneNumber: string = await question("Digite seu número de telefone: ")
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
        if (!phoneNumber) {
            throw new Error("Número de Telefone inválido")
        }
        const code: string = await riko.requestPairingCode(phoneNumber)
        console.log(`Codigo de Pareamento: ${code}`)
    }

    riko.ev.on("creds.update", saveCreds)

    riko.ev.on("chats.upsert", ()=>{
        console.log("Tem conversas", store.chats.all())
    })
    
    riko.ev.on("chats.update", async (updates: { id: string; unreadCount: number }[]) => {
        for (const chat of updates) {
            try {
                const metadata = await riko.groupMetadata(chat.id);
                const groupName = metadata.subject; 
    
                console.log(`Grupo atualizado: ${groupName}, mensagens não lidas: ${chat.unreadCount}`);
            } catch (err) {
                console.error(`Erro ao obter metadados para o chat ${chat.id}:`, err);
            }
        }
    });
    

    riko.ev.on("messages.upsert", async (reng)=>{
        const message = reng.messages && reng.messages[0]
        if (!message || !message.message) return
        const from = message.key.remoteJid
        const fromUser = message.key.participant?.split("@")[0] || message.key.remoteJid?.split("@")[0]
        const userName = message.pushName || fromUser
        const textMessage = message.message.conversation || message.message.extendedTextMessage?.text || ""
        const groupName = from.endsWith("@g.us") ? (await riko.groupMetadata(from)).subject : "" 
        console.log("metadados",groupName)

        if (textMessage) {
            const tolowerCase = textMessage.toLowerCase()
            if (tolowerCase.includes("oi") || tolowerCase.includes("ola")) {
                console.log("repondendo")
                await riko.sendMessage(from, {
                    text: "Ola tudo Bem"
                })
            }
        }

    })
}



