


export const extractMessage = (riko: any) =>{
    if (!riko || riko.message){
        return {
            media: undefined,
            mentions: [],
            fullMessages: "",
            from: undefined,
            isCommand: false,
            commandName: "",
            args: [],
            userName:undefined,
            userRole: undefined,
            partipant: undefined,
        }
    }
    const from = riko.key?.remoteJid || "Remetente desconhecido";
    
    const textMessage = riko.message?.conversation || ""
    const extendedTextMessage = riko.message?.extendedTextMessage?.text || riko.message?.extendedTextMessage.text || ""
    const imageMessage = riko.message?.imageMessage?.caption || ""
    const videoMessage = riko.message?.videoMessage?.caption || ""
    const quotedMessage = riko.message?.extendedTextMessage?.cotextInfo?.quotedMessage?.conversation || ""
    const fullMessage = textMessage || extendedTextMessage || imageMessage || videoMessage || quotedMessage

    const mentions = riko.message?.extendedTextMessage?.cotextInfo.mentionedJid
    const fromUser = riko.key?.partipant?.split("@")[0] || riko.key?.remoteJid?.split("@")[0]
    const userName = riko.pushName || fromUser

    return {
        quotedMessage,
        imageMessage,
        textMessage,
        mentions,
        userName,
        from
    }

}