import { PREFIX } from "../../../config";

module.exports = {
    name: "ping",
    descipition: "verificar o ping do bot",
    usage: `${PREFIX}ping`,
    handle: async ({sendReply, sendReact}) =>{
        sendReact("🏓")
        sendReply(`🏓 Ping!`);
    }
}